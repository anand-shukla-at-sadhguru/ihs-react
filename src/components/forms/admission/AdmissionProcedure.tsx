import { Button } from "@/components/ui/button";

type AdmissionProcedureProps = {
  onAgree?: () => void;
};

export default function AdmissionProcedure({ onAgree }: AdmissionProcedureProps) {
  return (
    <>
      <div className="bg-muted/50 rounded-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto shadow-sm">
        <h2 className="text-xl text-center font-semibold border-b pb-2">Application Instructions</h2>
        <div className="mb-3">
          <strong className="block mb-2 text-base">PLEASE NOTE DOWN THE FOLLOWING:</strong>
        </div>
        <ul className="list-disc list-inside space-y-3 text-xs sm:text-sm">
          <li>
            <span className="font-medium">Please use a desktop / laptop</span> to fill up the form (please do not use tablets / phones for that)
          </li>
          <li>
            <span className="font-medium">Do not refresh the page</span> while filling the application. If you refresh the page, you will lose the data entered in the application.
          </li>
          <li>
            <span className="font-medium">Before you start filling the form, please ensure you have the following documents ready in soft copy</span> (maximum file size of 5 MB, allowed file extensions: <span className="font-mono">.pdf, .jpg, .jpeg, .png</span>):
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Recent passport size photographs of the child</li>
              <li>Birth Certificate</li>
              <li>Previous School Academic Documents <span className="italic">(Optional for grade 2)</span></li>
              <li>Regular Medical Prescription</li>
              <li>Aadhar / Passport</li>
              <li>
                If Marital status is <span className="font-semibold">divorced</span> and if the guardian(s) has any of the following rights (<span className="italic">legal documents are required</span>):
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>to be allowed to visit child</li>
                  <li>to receive school communication</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <span className="font-medium">Students currently studying in Tamil Nadu, India</span> need to get their <span className="font-semibold">EMIS No</span> (This is a specific number given to all students studying in the state and can be procured from the current school). <span className="font-semibold">This is a mandatory field for such students.</span>
          </li>
          <li>
            <span className="font-medium">All fields are mandatory.</span> Incomplete records and incomplete forms will not be processed. The School does not assume the responsibility to notify in case of incomplete applications.
          </li>
          <li>
            <span className="font-medium">School records must reflect Name and other details as per official ID.</span> Please ensure that you enter the details for both parents and students as per their official ID which could either be the Aadhar Card or Passport.
          </li>
        </ul>
      </div>
      <div className="flex justify-center mt-10">
        <Button
          className="px-6 py-3 text-base md:text-lg font-semibold shadow"
          type="button"
          onClick={onAgree}
        >
          Proceed to Application Form
        </Button>
      </div>
    </>
  );
}
