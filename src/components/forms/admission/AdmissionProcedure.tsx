type AdmissionProcedureProps = {
  onAgree?: () => void;
};

export default function AdmissionProcedure({ onAgree }: AdmissionProcedureProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        A BRIEF OUTLINE OF THE ISHA HOME SCHOOL ADMISSION PROCESS
      </h1>
      <p className="mb-4 text-base md:text-lg">
        Thank you for your interest in Isha Home School. As you consider applying to Isha Home School for your child, please go through the various sections of our website (prospectus may vary with prior application). Please use a desktop/laptop to fill the form (do not use desktops/phones for that).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">OUR ADMISSIONS</h2>
      <p className="mb-2 text-base">
        As a policy, Isha Home School admits new students only in classes <span className="font-semibold">I, V, VIII and XI</span>. Admissions to other classes are open only when there are some vacancies which will be specifically displayed in the admissions web page. We do not however take any students in classes <span className="font-semibold">IX, X and XII</span>.
      </p>
      <p className="mb-2 text-base">
        The school reserves the right to decline applications without assigning any reason.
      </p>
      <p className="mb-2 text-base">
        There will be <span className="font-semibold">no refund of application fee</span>. So please consider this carefully before you hit the submit button.
      </p>
      <p className="mb-4 text-base">
        Please make sure you check your spam folder for emails that might end up there. The school will not be able to support any delays in response on this account.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">ADMISSION PROCEDURE</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-1">STAGE 1: FILLING THE APPLICATION FORM</h3>
          <p className="mb-2 text-base">
            Submit a new application via the website and follow the instructions there step by step. There is an application fee of <span className="font-semibold">Rs 750</span> which has to be paid online. The application process is complete when all the above are done.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">STAGE 2: APPLICATION PROCESSING</h3>
          <p className="mb-2 text-base">
            Once the application is submitted, you will receive an email confirming your submission. After which the admissions team will process the same and send you further communication to let you know either
          </p>
          <p className="mb-2 text-base">
            the candidate has been selected for the next round and the school will be processing the application further
          </p>
          <p className="mb-2 text-base">
            or
          </p>
          <p className="mb-2 text-base">
            an orientation date for the next round of the selection process will be communicated to you.
            <br />
            Stage 2 will typically take a month from the date your application is received. An Application Stage 2 fee of <span className="font-semibold">Rs. 4,000 (non-refundable)</span> will be applicable.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">STAGE 3: ORIENTATION (IF APPLICABLE)</h3>
          <p className="mb-2 text-base">
            The orientation session is compulsory. It provides parents, students and the school an opportunity to understand each other. It is essential for parents to get a good understanding about the school and its approach to education for it to completely benefit the child. Under normal circumstances, both the parents/guardians along with the child for whom admission is being sought at Isha Home School.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">All correspondence regarding admissions should be addressed to:</h2>
        <div className="bg-gray-50 rounded p-4 border text-sm md:text-base space-y-1">
          <div>Admissions Coordinator</div>
          <div>Isha Home School</div>
          <div>Velliangiri Foothills</div>
          <div>Coimbatore - 641114</div>
          <div>
            E-mail:{" "}
            <a
              href="mailto:admissions@ishahomeschool.org"
              className="text-blue-600 underline"
            >
              admissions@ishahomeschool.org
            </a>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow transition-colors text-base md:text-lg"
          type="button"
          onClick={onAgree}
        >
          I AGREE, CONTINUE TO ADMISSION APPLICATION
        </button>
      </div>
    </div>
  );
}
