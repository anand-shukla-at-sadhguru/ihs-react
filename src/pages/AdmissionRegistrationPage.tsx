import { AdmissionRegistrationForm } from '@/components/forms/admission/AdmissionRegistrationForm'; // Form will be here
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdmissionRegistrationPage() {
  return (
    <Card className="w-full mx-auto"> {/* Max width for better readability */}
      <CardHeader>
        <CardTitle>Student Admission Registration</CardTitle>
        <CardDescription>
          Please fill out the following details carefully. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdmissionRegistrationForm />
      </CardContent>
    </Card>
  );
}