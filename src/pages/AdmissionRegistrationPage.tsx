import { AdmissionRegistrationForm } from '@/components/forms/admission/AdmissionRegistrationYup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdmissionRegistrationPage() {
  return (
    <Card className="w-full mx-auto">
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