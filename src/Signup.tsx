import type React from "react"

import { useState } from "react"
import FormSection from "./components/form/section"
import FormInput from "./components/form/input"
import BankStatementDropzone, { MAX_BANK_STATEMENTS } from "./components/form/bank-statement-dropzone"
import { Link } from "react-router"

interface FormErrors {
  [key: string]: string
}

const initialFormData = {
  // Company Information
  legalName: "",
  dba: "",
  ein: "",
  address: "",
  email: "",
  phone: "",
  // ISO Information
  isoName: "",
  title: "",
  signature: "",
  consentNonMarketing: false,
  consentMarketing: false,
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateEIN = (ein: string): boolean => {
  const einRegex = /^\d{2}-\d{7}$/
  return einRegex.test(ein)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-$$$$]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

export function Signup() {
  const [formData, setFormData] = useState(initialFormData)
  const [bankStatements, setBankStatements] = useState<File[]>([])

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name, type, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Company Information validation
    if (!formData.legalName.trim()) {
      newErrors.legalName = "Legal name is required"
    }
    if (!formData.ein.trim()) {
      newErrors.ein = "EIN is required"
    } else if (!validateEIN(formData.ein)) {
      newErrors.ein = "EIN must be in format XX-XXXXXXX"
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // ISO Information validation
    if (!formData.isoName.trim()) {
      newErrors.isoName = "ISO name is required"
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.signature.trim()) {
      newErrors.signature = "Signature is required"
    }
    if (bankStatements.length !== MAX_BANK_STATEMENTS) {
      newErrors.bankStatements = `Upload exactly ${MAX_BANK_STATEMENTS} bank statements`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBankStatementsChange = (files: File[]) => {
    setBankStatements(files)
    if (errors.bankStatements) {
      setErrors((prev) => ({
        ...prev,
        bankStatements: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(false)
    setSubmitError("")

    if (!validateForm()) {
      return
    }

    const applicationData = new FormData()
    applicationData.append("application", JSON.stringify(formData))
    Object.entries(formData).forEach(([key, value]) => {
      applicationData.append(key, String(value))
    })
    bankStatements.forEach((file) => {
      applicationData.append("bankStatements", file, file.name)
    })

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/applications", {
        method: "POST",
        body: applicationData,
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || "Application upload failed")
      }

      console.log("Application submitted:", result)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Application upload failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setBankStatements([])
    setErrors({})
    setSubmitError("")
    setSubmitted(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Apply Today</h1>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-10">
          <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-8">
            {/* Company Information Section */}
            <FormSection title="Company Information" description="Provide your business details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Legal Name"
                  name="legalName"
                  type="text"
                  placeholder="Enter legal business name"
                  value={formData.legalName}
                  onChange={handleChange}
                  required
                  error={errors.legalName}
                />
                <FormInput
                  label="D/B/A (Doing Business As)"
                  name="dba"
                  type="text"
                  placeholder="Enter DBA if applicable"
                  value={formData.dba}
                  onChange={handleChange}
                />
                <FormInput
                  label="EIN"
                  name="ein"
                  type="text"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={handleChange}
                  required
                  error={errors.ein}
                />
                <FormInput
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  error={errors.phone}
                />
              </div>
              <FormInput
                label="Address"
                name="address"
                type="text"
                placeholder="Enter full business address"
                value={formData.address}
                onChange={handleChange}
                required
                error={errors.address}
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
              />
            </FormSection>

            <div className="border-t border-border pt-8">
              <FormSection title="Bank Statements" description="Upload the three most recent statements">
                <BankStatementDropzone
                  files={bankStatements}
                  onFilesChange={handleBankStatementsChange}
                  error={errors.bankStatements}
                  disabled={isSubmitting}
                />
              </FormSection>
            </div>

            {/* ISO Information Section */}
            <div className="border-t border-border pt-8">
              <FormSection
                title="Authorized Signatory Information"
                description="Information about the person authorized to sign"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Name"
                    name="isoName"
                    type="text"
                    placeholder="Full name"
                    value={formData.isoName}
                    onChange={handleChange}
                    required
                    error={errors.isoName}
                  />
                  <FormInput
                    label="Title"
                    name="title"
                    type="text"
                    placeholder="e.g., CEO, President"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    error={errors.title}
                  />
                </div>
                <FormInput
                  label="Signature"
                  name="signature"
                  type="text"
                  placeholder="Type your full name as signature"
                  value={formData.signature}
                  onChange={handleChange}
                  required
                  error={errors.signature}
                />
              </FormSection>
            </div>

             <div className="border-t border-border pt-8">
              <FormSection title="Communication Preferences" description="Choose how you'd like to receive updates">
                {/* Non-Marketing SMS Consent */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consentNonMarketing"
                      name="consentNonMarketing"
                      checked={formData.consentNonMarketing}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded border-border bg-background cursor-pointer accent-primary"
                    />
                    <label
                      htmlFor="consentNonMarketing"
                      className="flex-1 cursor-pointer text-sm text-foreground leading-relaxed"
                    >
                      <span className="font-medium block mb-1">Service Updates & Notifications</span>I agree to receive
                      non-marketing SMS messages regarding customer care, service updates, reminders, notifications,
                      scheduling links, booking confirmations, and follow-ups. Message frequency may vary. Reply 'HELP'
                      for assistance or 'STOP' to unsubscribe. Standard message and data rates may apply. My information
                      will be handled in accordance with the{" "}
                      <Link to="/privacy-policy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.consentNonMarketing && (
                    <p className="text-sm text-red-500 ml-8">{errors.consentNonMarketing}</p>
                  )}
                </div>

                {/* Marketing SMS Consent */}
                <div className="flex items-start gap-3 mt-6">
                  <input
                    type="checkbox"
                    id="consentMarketing"
                    name="consentMarketing"
                    checked={formData.consentMarketing}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-border bg-background cursor-pointer accent-primary"
                  />
                  <label
                    htmlFor="consentMarketing"
                    className="flex-1 cursor-pointer text-sm text-foreground leading-relaxed"
                  >
                    <span className="font-medium block mb-1">Marketing Messages</span>I also agree to receive marketing
                    SMS messages regarding promotional offers. Message frequency may vary. Reply 'HELP' for assistance
                    or 'STOP' to unsubscribe. Standard message and data rates may apply. My information will be handled
                    in accordance with the{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </FormSection>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-500 text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
              <button
                type="reset"
                disabled={isSubmitting}
                className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
              >
                Clear
              </button>
            </div>

            {/* Success Message */}
            {submitted && (
              <div className="bg-accent/10 border border-accent rounded-lg p-4 text-accent-foreground text-center font-medium animate-in fade-in">
                Application submitted successfully!
              </div>
            )}

            {submitError && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-center font-medium">
                {submitError}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By submitting this form, you agree to our{" "}
            <Link to="/terms-of-service" className="text-indigo-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-indigo-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
