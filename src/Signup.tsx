import type React from "react"

import { useState } from "react"
import FormSection from "./components/form/section"
import FormInput from "./components/form/input"

interface FormErrors {
  [key: string]: string
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
  const [formData, setFormData] = useState({
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
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("Form submitted:", formData)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
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
          <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* ISO Information Section */}
            <div className="border-t border-border pt-8">
              <FormSection
                title="Authorized Signatory Information"
                description="Information about the person authorized to sign"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="ISO Name"
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

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-indigo-500 text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-bg-indigo-500/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
              >
                Submit Application
              </button>
              <button
                type="reset"
                className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
              >
                Clear
              </button>
            </div>

            {/* Success Message */}
            {submitted && (
              <div className="bg-accent/10 border border-accent rounded-lg p-4 text-accent-foreground text-center font-medium animate-in fade-in">
                ✓ Application submitted successfully!
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By submitting this form, you agree to our{" "}
            <a href="#" className="text-indigo-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-indigo-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

