import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";

export function Calculator() {
  const [credit, setCredit] = useState(20000);
  const [months, setMonths] = useState(12);

  const output = credit / (months * 30);

  return (
    <section className="py-12">
      <h2 className="text-4xl text-center lg:text-5xl mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
        Our Small Business Term Loan Calculator
      </h2>
      <p className="text-center text-white/70  max-w-5xl mx-auto">
        Enter your desired loan amount and watch as our term loan calculator
        delivers easy-to-ready figures that will help you determine how much you
        can afford and how much interest you are willing to pay.
      </p>
      <div className="mx-auto w-screen max-w-5xl mt-12">
        <Card className="overflow-hidden">
          <CardHeader className="text-center bg-gray-900 py-2">
            Calculates Your Daily Payment
          </CardHeader>
          <CardContent className="flex divide">
            <div className="flex-1">
              <label className="mt-4 block space-y-2">
                <span className="block text-center text-xl font-thin">
                  Desired Credit Limit
                </span>
                <span className="block text-center font-bold text-lg">
                  ${credit}
                </span>
                <Slider
                  min={20000}
                  max={500000}
                  step={1000}
                  defaultValue={[credit]}
                  onValueChange={([e]) => {
                    setCredit(e);
                  }}
                />
              </label>
              <label className="mt-4 block space-y-2">
                <span className="block text-center text-xl font-thin">
                  Repayment Periods
                </span>
                <span className="block text-center font-bold text-lg">
                  {months} Months
                </span>
                <Slider
                  min={12}
                  max={24}
                  step={1}
                  onValueChange={([e]) => {
                    setMonths(e);
                  }}
                />
              </label>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl mb-3">Estimated Daily Payment*</div>
              <div className="text-5xl block bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                ${output.toFixed(2)}
              </div>
              <div className="flex items-center justify-center mt-3">
                <Button variant="outline">Apply Now</Button>
              </div>
              <p className="text-center text-sm text-white/70  max-w-5xl mx-auto mt-4 px-5">
                *Interest rates are approximate, actual rate will depend on
                other factors in addition to credit score.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
