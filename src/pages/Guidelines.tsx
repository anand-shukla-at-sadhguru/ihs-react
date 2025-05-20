// src/pages/AboutPage.tsx
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Guidelines() {
  const navigate = useNavigate();

  return (
    <Card>
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h2 className="text-center text-3xl font-semibold my-3">A Brief Outline of the Isha Home School Admission Process</h2>

        <p>Thank you for your interest in Isha Home School. As you consider applying to Isha Home School for your child, please go through the various sections of our &nbsp;
          <a className="text-blue-600 underline" href="https://isha.sadhguru.org/isha-home-school">website</a> for important information about the school. Usually, prospective parents may visit the school with prior appointment.
          <strong> Please use a desktop / laptop to fill up the form (please do not use tablets / phones for that).</strong>
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-2">New Admissions</h3>
        <p>
          As a policy, Isha Home School admits new students only in classes II, V, VIII and XI. Admissions to other classes are open only when there are some vacancies which will be specifically displayed in the admissions page. We do not however take any students in classes IX, X and XII.
        </p>

        <p>The school reserves the right to decline applications without assigning any reason.</p>

        <p>There will be no refund of application fee. So please consider this carefully before you hit the submit button.</p>

        <p>Please make sure you check your spam folder for emails that might end up there. The school will not be able to support any delays in your response on this account.</p>

        <h3 className="text-2xl font-semibold mt-6 mb-2">Admission Procedure</h3>

        <h4 className="text-xl font-semibold mt-4 mb-1">Stage 1: Filling the Application Form</h4>
        <p>
          Submit a new application via this website and follow the instructions at each step. There is an application fee of Rs 750 which has to be paid online. The application process is complete when all the above are done.
        </p>

        <h4 className="text-xl font-semibold mt-4 mb-1">Stage 2: Application Processing</h4>
        <p>
          Once the application is submitted, you will receive an email confirming your submission. After which the admissions team will process the same and will send you further communication to let you know
        </p>

        <p>either</p>
        <p>
          the candidate has not been selected for the next round and the school will not be processing the application any further. This will bring the admission process to an end. The school reserves the right to decline applications without assigning any reason.
        </p>

        <p>or</p>
        <p>
          an orientation date for the next round of the selection process will be communicated to you. Stage 2 will typically take a month from the date your application is received. An Application Stage 2 fee of Rs. 4000 (non-refundable) will be applicable.
        </p>

        <h4 className="text-xl font-semibold mt-4 mb-1">Stage 3: Orientation (if applicable)</h4>
        <p>
          The orientation session is compulsory. It provides parents, students and the school an opportunity to understand each other. It is essential for parents to get a good understanding about the school and its approach to education for it to be completely beneficial for the child. Under normal circumstances, both the parents/guardians along with the child (for whom admission is being sought) attend an orientation at Isha Home School.
        </p>

        <p className="mt-4">
          All correspondence regarding admissions should be addressed to:<br />
          <strong>
            Admission Coordinator<br />
            Isha Home School<br />
            Velliangiri Foothills<br />
            Coimbatore – 641114<br />
            E-mail:
          </strong>{" "}
          admissions@ishahomeschool.org
        </p>

        <div className="flex justify-center mt-10">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow transition-colors text-base md:text-lg"
            type="button"
            onClick={() => {
              localStorage.setItem("admissions_agreed", "true");
              navigate("/admission");
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </Card>
  );
}