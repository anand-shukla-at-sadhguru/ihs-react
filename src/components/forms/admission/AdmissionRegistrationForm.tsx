import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Make sure this path points to the updated schema file from the previous step
import { admissionRegistrationSchema, type AdmissionRegistrationFormData } from './admissionRegistrationSchema';
//ok
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Commented out toast as per original user code in this file
// import { toast } from "@/components/ui/use-toast";
// TODO: Add DatePicker component if not already present
// import { DatePicker } from "@/components/ui/date-picker";
// TODO: Add useFieldArray if implementing OTHER Table fields (like languages, previous schools)
// import { useFieldArray } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import AdmissionProcedure from './AdmissionProcedure';

// --- Helper Function to parse Frappe Select options ---
const parseSelectOptions = (optionsString: string | null | undefined): string[] => {
    if (!optionsString) return [];
    return optionsString.split('\n').map(o => o.trim()).filter(o => o.length > 0);
};

export function AdmissionRegistrationForm() {
  // 1. Define form with updated default values
  const form = useForm<AdmissionRegistrationFormData>({
    resolver: zodResolver(admissionRegistrationSchema),
    // Updated default values reflecting the flattened schema for parents/siblings
    defaultValues: {
      application_year: '2024-25',
      applied_for: 'Class V',
      applicant_user: 'john.doe@example.com',
      applied_to_ihs_before: 'No',
      previous_application_application_year: '',
      previous_application_applied_for: '',
      previous_application_remarks: '',
      full_name: 'John Doe',
      gender: 'Male',
      other_gender: '',
      nationality: 'Indian',
      country_of_residence: 'India',
      country: 'India',
      date_of_birth: '2012-01-01',
      age: '12',
      comm_address_country: 'India',
      comm_address_area_code: '600001',
      comm_address_line_1: '123 Main Street',
      comm_address_line_2: 'Apt 4B',
      comm_address_city: 'Chennai',
      comm_address_state: 'Tamilnadu',
      identification_mark_1: 'Mole on left cheek',
      religion: 'Hindu',
      community: 'OC',
      identification_mark_2: 'Scar on right knee',
      other_religion: '',
      other_community: '',
      mother_tongue: 'Tamil',
      second_language: 'Hindi',
      third_language: '',
      optional_language_table: [], // Keep if still a table
      has_sibling_in_ihs: 'No',
      // NEW Sibling fields
      sibling_1_full_name: "",
      sibling_1_grade_status: "",
      sibling_1_school_name: "",
      // END NEW Sibling fields
      recent_photograph: undefined,
      birth_certificate: undefined,
      id_proof: 'Aadhaar Card',
      id_proof_document: undefined,
      aadhaar_number: '1234-5678-9012',
      passport_number: '',
      place_of_issue: '',
      date_of_issue: '', // Initialize date strings
      date_of_expiry: '', // Initialize date strings
      is_home_schooled: 'No',
      current_school_name: 'ABC Public School',
      board_affiliation: '',
      board_affiliation_data2: 'CBSE',
      phone_number: '9876543210',
      current_school_country: 'India',
      current_school_area_code: '600001',
      current_school_city: 'Chennai',
      current_school_state: 'Tamilnadu',
      email_address: 'school@example.com',
      current_school_a_line1: '456 School Road',
      current_school_a_line2: '',
      was_the_applicant_ever_home_schooled: 'No',
      been_to_school_previously: 'Yes',
      previous_schools: [], // Keep if still a table
      emis_id: 'TN123456',
      academic_strengths_and_weaknesses: 'Good in Math, needs improvement in English.',
      hobbies_interests_and_extra_curricular_activities: 'Football, Painting',
      other_details_of_importance: '',
      temperament_and_personality: 'Calm and friendly',
      special_learning_needs_or_learning_disability: 'None',
      done_smallpox_vaccine: 'Yes',
      done_hepatitis_a_vaccine: 'Yes',
      done_hepatitis_b_vaccine: 'Yes',
      done_tdap_vaccine: 'Yes',
      done_typhoid_vaccine: 'Yes',
      done_measles_vaccine: 'Yes',
      done_polio_vaccine: 'Yes',
      done_mumps_vaccine: 'Yes',
      done_rubella_vaccine: 'Yes',
      done_varicella_vaccine: 'Yes',
      other_vaccines: '',
      vaccine_certificates: undefined,
      blood_group: 'Blood Group O+',
      wears_glasses_or_lens: 'No',
      right_eye_power: '',
      left_eye_power: '',
      is_toilet_trained: 'Yes',
      wets_bed: 'No',
      has_hearing_challenges: 'No',
      hearing_challenges: '',
      has_behavioural_challenges: 'No',
      behavioural_challenges: '', // Fixed typo
      has_physical_challenges: 'No',
      physical_challenges: '',
      has_speech_challenges: 'No',
      speech_challenges: '',
      has_injury: 'No',
      injury_details: '',
      on_medication: 'No',
      medication_details: '', // Fixed typo
      medical_prescription: undefined,
      has_health_issue: 'No',
      health_issue_details: '',
      was_hospitalized: 'No',
      hospitalization_details: '',
      needs_special_attention: 'No',
      attention_details: '',
      has_allergies: 'No', // Fixed typo
      // NEW Parent fields
      mother_full_name: "Jane Doe",
      mother_email: "jane.doe@example.com",
      mother_phone: "9876543211",
      mother_occupation: "Teacher",
      mother_education: "M.A.",
      father_full_name: "Richard Roe",
      father_email: "richard.roe@example.com",
      father_phone: "9876543212",
      father_occupation: "Engineer",
      father_education: "B.Tech",
      // END NEW Parent fields
      parent_marital_status: 'Married',
      who_is_responsible_for_paying_applicants_tuition_fee: undefined, // Fixed typo
      court_order_document: undefined,
      who_is_allowed_to_receive_school_communication: undefined,
      legal_rights_document: undefined,
      who_is_allowed_to_receive_report_cards: undefined,
      visit_rights: undefined,
      parents_are_guardians: 'Yes',
      guardian_information: [], // Keep if still table, otherwise add individual defaults
      group_a: undefined,
      group_c: undefined,
      group_b: undefined,
      group_d: undefined,
      q1_applicant_response: '',
      q2_applicant_response: '',
      q3_applicant_response: '',
      q4_applicant_response: '',
      q5_applicant_response: '',
      q6_applicant_response: '',
      q7_applicant_response: '',
      q1_parent_response: '',
      q2_parent_response: '',
      q3_parent_response: '',
      q4_parent_response: '',
      q5_parent_response: '',
      q6_parent_response: '',
      tnc_check: true,
      date: '2024-06-01', // Initialize date strings
      place: 'Chennai',
      billing_name: 'John Doe',
      billing_phone: '9876543210',
      billing_email: 'john.doe@example.com',
      billing_country: 'India',
      billing_area_code: '600001',
      billing_city: 'Chennai',
      billing_state: 'Tamilnadu',
      billing_address_l1: '123 Main Street',
      billing_address_l2: '',
      application_fee_status: 'Pending',
      program: 'General',
      payment_program_links: [], // Keep if still table
      amended_from: '',
      application_feedback_status: 'Yes', // Changed from 'Pending' to a valid option
      application_feedback: '',
      orientation_feedback_status: 'Yes', // Changed from 'Pending' to a valid option
      academics_feedback: '',
      group_activities_feedback: '',
      sports_feedback: '',
      dining: '',
      other_feedback: '',
      interview_feedback_status: 'Probable Yes', // Changed from 'Pending' to a valid option
      interview_feedback: '',
    },
    mode: 'onBlur', // Validate on blur
  });

  // 2. Watch fields (Keep existing watches, they are still relevant for conditional logic)
  const watchAppliedBefore = form.watch("applied_to_ihs_before");
  const watchGender = form.watch("gender");
  const watchReligion = form.watch("religion");
  const watchCommunity = form.watch("community");
  const watchAppliedFor = form.watch("applied_for");
  const watchHasSibling = form.watch("has_sibling_in_ihs"); // Used for sibling section visibility
  const watchIdProof = form.watch("id_proof");
  const watchIsHomeSchooled = form.watch("is_home_schooled");
  // const watchStudiedPreviously = form.watch("been_to_school_previously");
  const watchCurrentSchoolState = form.watch("current_school_state");
  const watchWearsGlasses = form.watch("wears_glasses_or_lens");
  const watchHearing = form.watch("has_hearing_challenges");
  const watchBehavioural = form.watch("has_behavioural_challenges");
  const watchPhysical = form.watch("has_physical_challenges");
  const watchSpeech = form.watch("has_speech_challenges");
  const watchInjury = form.watch("has_injury");
  const watchMedication = form.watch("on_medication");
  const watchHealthIssue = form.watch("has_health_issue");
  const watchHospitalized = form.watch("was_hospitalized");
  const watchSpecialAttention = form.watch("needs_special_attention");
  const watchAllergies = form.watch("has_allergies"); // Fixed typo
  const watchMaritalStatus = form.watch("parent_marital_status"); // Used for divorce section
  // const watchParentsAreGuardians = form.watch("parents_are_guardians"); // Used for guardian section
  // const watchWhoPaysTuition = form.watch("who_is_responsible_for_paying_applicants_tuition_fee"); // Fixed typo

  // 3. Define submit handler (remains the same conceptually)
  async function onSubmit(values: AdmissionRegistrationFormData) {
    // Check for errors (keep this part)
    if (!form.formState.isValid) {
      const errorMessages = Object.entries(form.formState.errors)
        .map(([field, error]: [string, any]) => `${field}: ${error?.message || 'Invalid value'}`)
        .join('\n');
      alert("Please fix the following errors before submitting:\n\n" + errorMessages);
      console.error("Form validation errors:", form.formState.errors);
      return;
    }

    console.log("Original Form Values:", values);

    // --- Prepare a plain JavaScript object for JSON ---
    const payload: { [key: string]: any } = {};

    // Helper function to convert File to Base64
    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Reads as data: MIME type;base64, data
            reader.onload = () => {
                // Odoo often just wants the base64 part, without the prefix
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });

    try {
        // Iterate and build the payload object
        for (const [key, value] of Object.entries(values)) {
            // Handle file uploads by converting to Base64
            if (key === 'recent_photograph' || key === 'birth_certificate' || key === 'id_proof_document' || key === 'vaccine_certificates' || key === 'medical_prescription' || key === 'court_order_document' || key === 'legal_rights_document') {
                if (value instanceof File) {
                    // Store filename separately if needed by backend
                    payload[`${key}_filename`] = value.name;
                    payload[key] = await fileToBase64(value); // Assign base64 string
                } else {
                    payload[key] = null; // Or handle cases where file might be optional/cleared
                }
            }
            // Handle arrays (tables) - keep them as arrays for JSON
            else if (key === 'optional_language_table' || key === 'previous_schools' || key === 'guardian_information' || key === 'payment_program_links') {
                 payload[key] = Array.isArray(value) ? value : []; // Ensure it's an array
            }
             // Handle boolean (send as boolean for JSON)
            else if (typeof value === 'boolean') {
                 payload[key] = value;
            }
            // Handle null/undefined/empty strings explicitly if needed, otherwise assign directly
            else if (value !== undefined) {
                 payload[key] = value; // Keep null or empty strings if they have meaning
            }
            // Note: You might want to filter out empty strings '' depending on backend logic
            // else if (value !== null && value !== undefined && value !== '') {
            //      payload[key] = value;
            // }
        }

        console.log("JSON Payload Prepared:", payload);

        const response = await fetch('http://test-qa-ihs.isha.in/student-register', {
            method: 'POST',
            credentials: 'include', // Important: sends cookies for authentication
            headers: {
                // Correct Content-Type for JSON
                'Content-Type': 'application/json'
            },
            // Send the stringified plain object, NOT FormData
            body: JSON.stringify(payload)
        });

        // --- Check Response ---
        if (!response.ok) {
            // Try to parse error response from Odoo
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If response is not JSON
                errorData = { message: response.statusText };
            }
            console.error("Submission Error:", response.status, errorData);
            alert(`Submission failed: ${errorData?.message || 'Unknown error'}`);
            // You might want more specific error handling based on errorData.error
            return; // Stop execution on error
        }

        // --- Handle Success ---
        const successData = await response.json(); // Assuming Odoo returns JSON on success too
        console.log("Form submitted successfully!", successData);
        alert("Form submitted successfully!"); // Or use a toast notification

    } catch (error) {
        console.error("Network or other fetch error:", error);
        alert("An error occurred while submitting the form. Please check your connection and try again.");
    }
  }

  // --- Render Helper for Fields ---
  const renderField = (fieldName: keyof AdmissionRegistrationFormData, ff: any /* Frappe Field Def */) => {
     const options = ff.options || '';
     const fieldtype = ff.fieldtype || 'Data';
     const label = ff.label || fieldName;
     const reqd = ff.reqd || 0;
     const isRequired = reqd === 1;

     const labelContent = (
        <>
          {label}
          {isRequired ? <span className="text-destructive"> *</span> : ''}
        </>
      );

     return (
        <FormField
          control={form.control}
          name={fieldName as any}
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>{labelContent}</FormLabel>
                <FormControl>
                   {/* Wrap the entire conditional block in a single div */}
                   <div>
                     {fieldtype === 'Data' && options === 'Email' && <Input type="email" placeholder={label} {...field} value={field.value ?? ''}/>}
                     {fieldtype === 'Data' && options !== 'Email' && <Input placeholder={label} {...field} value={field.value ?? ''}/>}
                     {fieldtype === 'Phone' && <Input type="tel" placeholder={label} {...field} value={field.value ?? ''}/>}
                     {fieldtype === 'Small Text' && <Textarea placeholder={`Enter ${label}...`} {...field} value={field.value ?? ''}/>}
                     {fieldtype === 'Date' && (
                        <Input type="date" placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''}/>
                     )}
                     {fieldtype === 'Select' && (
                         <Select onValueChange={field.onChange} value={field.value ?? ''}>
                           <SelectTrigger>
                             <SelectValue placeholder={`Select ${label}`} />
                           </SelectTrigger>
                           <SelectContent>
                             {parseSelectOptions(options).map(opt => (
                               <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                     )}
                     {fieldtype === 'Check' && (
                          <div className="flex items-center space-x-2 pt-2">
                              <Checkbox
                                  id={fieldName}
                                  checked={!!field.value}
                                  onCheckedChange={field.onChange}
                              />
                              <label htmlFor={fieldName} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                 {label}
                              </label>
                          </div>
                     )}
                     {fieldtype === 'Attach' && (
                         <Input
                             type="file"
                              className='pt-1.5'
                             onChange={(e) => {
                                 field.onChange(e.target.files ? e.target.files[0] : null);
                              }}
                         />
                     )}
                     {fieldtype === 'Link' && (
                        <Input placeholder={`${label} (Link - Enter ID/Name)`} {...field} value={field.value ?? ''} />
                     )}
                     {fieldtype === 'Table' && (
                         <div className="p-3 border rounded bg-muted/50 text-sm space-y-2">
                            <p className="font-semibold">{label}</p>
                            <p className="text-muted-foreground">[Table field '{fieldName}' UI not implemented yet]</p>
                            <Button type="button" size="sm" variant="outline" disabled>Add Row</Button>
                         </div>
                     )}
                   </div>
                 </FormControl>
                {ff.description && <FormDescription>{ff.description}</FormDescription>}
                <FormMessage />
            </FormItem>
          )}
        />
     );
  };

  // Tab state for navigation
  const TAB_KEYS = [
    "instruction", // Added instruction tab as the first tab
    "personal",
    "academic",
    "health",
    "parents",
    "declaration",
    "billing"
  ];
  const [tab, setTab] = useState(TAB_KEYS[0]);
  const tabIndex = TAB_KEYS.indexOf(tab);
  const isFirstTab = tabIndex === 0;
  const isLastTab = tabIndex === TAB_KEYS.length - 1;

  // ... rest of the AdmissionRegistrationForm component ...
  // Remove or update this debug log if not needed
  console.log("form state errors", form.formState.errors,form.formState.isValid);

  return (
    <Form {...form}>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-between mb-4 overflow-x-auto">
          <TabsTrigger value="instruction" className="flex-1 min-w-[120px]">Instruction</TabsTrigger>
          <TabsTrigger value="personal" className="flex-1 min-w-[120px]">Personal</TabsTrigger>
          <TabsTrigger value="academic" className="flex-1 min-w-[120px]">Academic</TabsTrigger>
          <TabsTrigger value="health" className="flex-1 min-w-[120px]">Health</TabsTrigger>
          <TabsTrigger value="parents" className="flex-1 min-w-[120px]">Parents</TabsTrigger>
          <TabsTrigger value="declaration" className="flex-1 min-w-[120px]">Declaration</TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 min-w-[120px]">Billing</TabsTrigger>
        </TabsList>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="instruction">
            <section className="space-y-6">
              <AdmissionProcedure onAgree={() => setTab(TAB_KEYS[1])} />
            </section>
          </TabsContent>
          <TabsContent value="personal">
            {/* === Section: Initial Details === */}
            <section className="space-y-6">
             <h2 className="text-xl font-semibold border-b pb-2">Application & Personal Information</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4"> {/* Reduced gap-y */}
                 {/* Application Details */}
                 {renderField("application_year", { label: "Application Academic Year", fieldtype: "Link", options: "IHS Academic Year", reqd: 1 })}
                 {renderField("applied_for", { label: "Applied For", fieldtype: "Link", options: "IHS Admission Grade", reqd: 1 })}
                 {renderField("applicant_user", { label: "Applicant User (Optional)", fieldtype: "Link", options: "User" })}

                 {/* Previous Application */}
                 {renderField("applied_to_ihs_before", { label: "Have you applied to Isha Home School before?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                 {watchAppliedBefore === 'Yes' && renderField("previous_application_application_year", { label: "Previous Application Year", fieldtype: "Link", options: "IHS Academic Year", mandatory_depends_on: "Yes" })}
                 {watchAppliedBefore === 'Yes' && renderField("previous_application_applied_for", { label: "Previously Applied For Grade", fieldtype: "Link", options: "IHS Admission Grade", mandatory_depends_on: "Yes" })}
                 {watchAppliedBefore === 'Yes' && renderField("previous_application_remarks", { label: "Previous Application Remarks", fieldtype: "Data" })}

                 {/* Personal Information */}
                 {renderField("full_name", { label: "Full Name", fieldtype: "Data", reqd: 1 })}
                 {renderField("gender", { label: "Gender", fieldtype: "Select", options: "\nMale\nFemale\nOther", reqd: 1 })}
                 {watchGender === 'Other' && renderField("other_gender", { label: "Other Gender", fieldtype: "Data", mandatory_depends_on: "Other" })}
                 {renderField("nationality", { label: "Nationality", fieldtype: "Link", options: "Country", reqd: 1 })}
                 {renderField("country_of_residence", { label: "Country of Residence", fieldtype: "Link", options: "Country", reqd: 1 })}
                 {renderField("country", { label: "Country of Birth", fieldtype: "Link", options: "Country", reqd: 1 })}
                 {renderField("date_of_birth", { label: "Date of Birth", fieldtype: "Date", reqd: 1 })}
                 {/* Age field is likely read-only or calculated, omit from render helper if not editable */}
                 {/* {renderField("age", { label: "Age", fieldtype: "Data", read_only: 1 })} */}

                 {/* Communication Address - Span across columns */}
                 <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                     <h3 className="font-medium text-md mb-3">Communication Address</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                         {renderField("comm_address_line_1", { label: "Address Line 1", fieldtype: "Data", reqd: 1 })}
                         {renderField("comm_address_line_2", { label: "Address Line 2", fieldtype: "Data" })}
                         {renderField("comm_address_city", { label: "City/ Town", fieldtype: "Data", reqd: 1 })}
                         {renderField("comm_address_state", { label: "State", fieldtype: "Data", reqd: 1 })}
                         {renderField("comm_address_area_code", { label: "Area Code/ Pincode", fieldtype: "Data", reqd: 1 })}
                         {renderField("comm_address_country", { label: "Country", fieldtype: "Data", reqd: 1 })}
                     </div>
                 </div>

                  {/* Other Personal Info */}
                 {renderField("identification_mark_1", { label: "Identification Mark 1", fieldtype: "Data", reqd: 1 })}
                 {renderField("identification_mark_2", { label: "Identification Mark 2", fieldtype: "Data", reqd: 1 })}
                 {renderField("religion", { label: "Religion", fieldtype: "Select", options: "\nHindu\nMuslim\nChristian\nSikh\nJew\nOther", reqd: 1 })}
                 {watchReligion === 'Other' && renderField("other_religion", { label: "Other Religion", fieldtype: "Data", mandatory_depends_on: "Other" })}
                 {renderField("community", { label: "Community", fieldtype: "Select", options: "\nOC\nBC\nBC-Others\nMBC\nSC-Arunthathiyar\nSC-Others\nDNC (Denotified Communities)\nST\nOther", reqd: 1 })}
                 {watchCommunity === 'Other' && renderField("other_community", { label: "Other Community", fieldtype: "Data", mandatory_depends_on: "Other" })}


                 {/* Languages */}
                 {renderField("mother_tongue", { label: "Mother Tongue", fieldtype: "Data", reqd: 1 })}
                 {(watchAppliedFor === 'Class V' || watchAppliedFor === 'Class VIII') && renderField("second_language", { label: "Second Language", fieldtype: "Link", options: "IHS Admission Second Language", mandatory_depends_on: "V or VIII" })}
                 {watchAppliedFor === 'Class VIII' && renderField("third_language", { label: "Third Language", fieldtype: "Link", options: "IHS Admission Third Language", mandatory_depends_on: "VIII" })}
                 {/* Conditionally render or remove language table */}
                 {/* {renderField("optional_language_table", { label: "Other Language Proficiency", fieldtype: "Table", options: "IHS Language Proficiency"})} */}


                 {/* Sibling Info Question */}
                 {renderField("has_sibling_in_ihs", { label: "Does the Applicant have a sibling studying/ studied in IHS?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}

                 {/* Conditional Sibling Fields - Span across columns */}
                 {watchHasSibling === 'Yes' && (
                     <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                         <h3 className="font-medium text-md mb-3">Sibling Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                              {/* Render individual sibling fields */}
                              {renderField("sibling_1_full_name", { label: "Sibling's Full Name", fieldtype: "Data", mandatory_depends_on: "Yes" })}
                              {renderField("sibling_1_grade_status", { label: "Sibling's Grade / Status", fieldtype: "Data", description:"e.g., 'Studying in Class V', 'Completed Class XII'", mandatory_depends_on: "Yes" })}
                              {renderField("sibling_1_school_name", { label: "Sibling's School Name (if IHS)", fieldtype: "Data", description:"If studying in IHS" })}
                              {/* Add more sibling fields (sibling_2_...) here if needed */}
                         </div>
                     </div>
                 )}

                 {/* Supporting Documents */}
                 <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                     <h3 className="font-medium text-md mb-3">Supporting Documents</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                        {renderField("recent_photograph", { label: "Recent Photograph", fieldtype: "Attach", reqd: 1 })}
                        {renderField("birth_certificate", { label: "Birth Certificate", fieldtype: "Attach", reqd: 1 })}
                        {renderField("id_proof", { label: "ID Proof Type", fieldtype: "Select", options: "\nAadhaar Card\nPassport", reqd: 1 })}
                        {renderField("id_proof_document", { label: "ID Proof Document", fieldtype: "Attach", reqd: 1 })}
                        {/* Conditional ID Fields */}
                        {watchIdProof === 'Aadhaar Card' && renderField("aadhaar_number", { label: "Aadhaar Number", fieldtype: "Data", mandatory_depends_on: "Aadhaar Card" })}
                        {watchIdProof === 'Passport' && renderField("passport_number", { label: "Passport Number", fieldtype: "Data", mandatory_depends_on: "Passport" })}
                        {watchIdProof === 'Passport' && renderField("place_of_issue", { label: "Passport Place of Issue", fieldtype: "Data", mandatory_depends_on: "Passport" })}
                        {watchIdProof === 'Passport' && renderField("date_of_issue", { label: "Passport Date of Issue", fieldtype: "Date", mandatory_depends_on: "Passport" })}
                        {watchIdProof === 'Passport' && renderField("date_of_expiry", { label: "Passport Date of Expiry", fieldtype: "Date", mandatory_depends_on: "Passport" })}
                    </div>
                 </div>
             </div>
        </section>
          </TabsContent>
          <TabsContent value="academic">
            {/* === Section: Academics === */}
            <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {/* Current School Info */}
                {renderField("is_home_schooled", { label: "Is the applicant being home schooled?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}

                {/* Conditionally Render Current School Section */}
                {watchIsHomeSchooled === 'No' && (
                    <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                        <h3 className="font-medium text-md mb-3">Current School Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                             {renderField("current_school_name", { label: "School Name", fieldtype: "Data", mandatory_depends_on: "No" })}
                             {renderField("board_affiliation_data2", { label: "Board Affiliation", fieldtype: "Data", mandatory_depends_on: "No" })} {/* Assuming data2 is correct */}
                             {renderField("phone_number", { label: "School Phone Number", fieldtype: "Phone", mandatory_depends_on: "No" })}
                             {renderField("email_address", { label: "School Email Address", fieldtype: "Data", options:"Email", mandatory_depends_on: "No" })}
                             {renderField("current_school_a_line1", { label: "School Address Line 1", fieldtype: "Data", mandatory_depends_on: "No" })}
                             {renderField("current_school_a_line2", { label: "School Address Line 2", fieldtype: "Data" })}
                             {renderField("current_school_city", { label: "School City/ Town", fieldtype: "Data", mandatory_depends_on: "No" })}
                             {renderField("current_school_state", { label: "School State", fieldtype: "Data" })}
                             {renderField("current_school_area_code", { label: "School Area Code/ Pincode", fieldtype: "Data" })}
                             {renderField("current_school_country", { label: "School Country", fieldtype: "Link", options:"Country", mandatory_depends_on: "No" })}
                         </div>
                    </div>
                )}

                {/* Previous School Info */}
                 <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                     <h3 className="font-medium text-md mb-3">Previous Schooling</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                        {watchIsHomeSchooled === 'No' && renderField("was_the_applicant_ever_home_schooled", { label: "Was applicant ever home schooled?", fieldtype: "Select", options: "\nYes\nNo", mandatory_depends_on: "No" })}
                        {renderField("been_to_school_previously", { label: "Studied previously in any school?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                         {/* Conditionally render or remove previous schools table */}
                        {/* {watchStudiedPreviously === 'Yes' && renderField("previous_schools", { label: "Previous School(s)", fieldtype: "Table", options: "IHS Student Applicant Previous School", mandatory_depends_on: "Yes" })} */}
                        {/* EMIS ID */}
                        {watchCurrentSchoolState === 'Tamilnadu' && renderField("emis_id", { label: "EMIS ID (if applicable)", fieldtype: "Data" })}
                     </div>
                 </div>

                 {/* More Academic Info */}
                 <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                     <h3 className="font-medium text-md mb-3">Additional Academic Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {renderField("academic_strengths_and_weaknesses", { label: "Academic Strengths and Weaknesses", fieldtype: "Small Text", reqd: 1 })}
                        {renderField("temperament_and_personality", { label: "Temperament and Personality", fieldtype: "Small Text", reqd: 1 })}
                        {renderField("hobbies_interests_and_extra_curricular_activities", { label: "Hobbies, Interests & Extra-Curricular Activities", fieldtype: "Small Text", reqd: 1 })}
                        {renderField("special_learning_needs_or_learning_disability", { label: "Special Learning Needs or Disability", fieldtype: "Small Text", reqd: 1 })}
                        {renderField("other_details_of_importance", { label: "Other Details of Importance", fieldtype: "Small Text" })}
                     </div>
                 </div>
            </div>
        </section>
          </TabsContent>
          <TabsContent value="health">
            {/* === Section: Health === */}
            <section className="space-y-6">
             <h2 className="text-xl font-semibold border-b pb-2">Health Information</h2>
              <div className="space-y-6">
                 {/* Vaccines */}
                 <h3 className="font-medium text-md">Vaccination Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                     {renderField("done_smallpox_vaccine", { label: "Protected from Smallpox?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_hepatitis_a_vaccine", { label: "Protected from Hepatitis A?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_hepatitis_b_vaccine", { label: "Protected from Hepatitis B?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_tdap_vaccine", { label: "Protected from Tdap?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_typhoid_vaccine", { label: "Protected from Typhoid?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_measles_vaccine", { label: "Protected from Measles?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_polio_vaccine", { label: "Protected from Polio?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_mumps_vaccine", { label: "Protected from Mumps?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_rubella_vaccine", { label: "Protected from Rubella?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("done_varicella_vaccine", { label: "Protected from Varicella?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {renderField("other_vaccines", { label: "Other Vaccinations", fieldtype: "Data" })}
                     {renderField("vaccine_certificates", { label: "Vaccine Certificate(s)", fieldtype: "Attach", reqd: 1 })}
                 </div>

                 {/* Additional Health */}
                 <h3 className="font-medium text-md pt-4 border-t mt-4">Additional Health Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                     {renderField("blood_group", { label: "Blood Group", fieldtype: "Select", options: "\nBlood Group A+\nBlood Group A-\nBlood Group B+\nBlood Group B-\nBlood Group O+\nBlood Group O-\nBlood Group AB+\nBlood Group AB-", reqd: 1 })}
                     {renderField("wears_glasses_or_lens", { label: "Wears glasses or lenses?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {watchWearsGlasses === 'Yes' && renderField("right_eye_power", { label: "Right Eye Power", fieldtype: "Data", mandatory_depends_on: "Yes" })}
                     {watchWearsGlasses === 'Yes' && renderField("left_eye_power", { label: "Left Eye Power", fieldtype: "Data", mandatory_depends_on: "Yes" })}
                     {/* Hygiene for Class II */}
                     {watchAppliedFor === 'Class II' && renderField("is_toilet_trained", { label: "Is Applicant toilet-trained?", fieldtype: "Select", options:"\nYes\nNo", mandatory_depends_on:"Class II"})}
                     {watchAppliedFor === 'Class II' && renderField("wets_bed", { label: "Does Applicant bed-wet?", fieldtype: "Select", options:"\nYes\nNo", mandatory_depends_on:"Class II"})}
                 </div>

                  {/* Challenges */}
                 <h3 className="font-medium text-md pt-4 border-t mt-4">Physical & Mental Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     {renderField("has_hearing_challenges", { label: "Any hearing challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {watchHearing === 'Yes' && renderField("hearing_challenges", { label: "Hearing Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                     {renderField("has_physical_challenges", { label: "Any physical challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {watchPhysical === 'Yes' && renderField("physical_challenges", { label: "Physical Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                     {renderField("has_behavioural_challenges", { label: "Any psych./behavioural challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {watchBehavioural === 'Yes' && renderField("behavioural_challenges", { label: "Psych./Behavioural Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })} {/* Fixed typo */}
                     {renderField("has_speech_challenges", { label: "Any speech challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {watchSpeech === 'Yes' && renderField("speech_challenges", { label: "Speech Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                 </div>

                  {/* Medical History */}
                 <h3 className="font-medium text-md pt-4 border-t mt-4">Medical History</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {renderField("has_injury", { label: "History of accident/ injury?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                    {watchInjury === 'Yes' && renderField("injury_details", { label: "Accident/ Injury Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                     {renderField("has_health_issue", { label: "History of any health Issue?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                    {watchHealthIssue === 'Yes' && renderField("health_issue_details", { label: "Health Issue Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                     {renderField("on_medication", { label: "On regular medication?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                     {watchMedication === 'Yes' && renderField("medication_details", { label: "Medication Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })} {/* Fixed typo */}
                    {watchMedication === 'Yes' && renderField("medical_prescription", { label: "Medical Prescription", fieldtype: "Attach", mandatory_depends_on: "Yes" })}
                    {renderField("was_hospitalized", { label: "History of hospitalization/ surgery?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                    {watchHospitalized === 'Yes' && renderField("hospitalization_details", { label: "Hospitalization/ Surgery Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                     {renderField("needs_special_attention", { label: "Other health issue needing special attention?", fieldtype: "Select", options: "\nYes\nNo" })}
                     {watchSpecialAttention === 'Yes' && renderField("attention_details", { label: "Special Attention Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                     {renderField("has_allergies", { label: "Any food/ drug allergies?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })} {/* Fixed typo */}
                     {watchAllergies === 'Yes' && renderField("allergy_details", { label: "Allergy Details", fieldtype: "Small Text", mandatory_depends_on: "Yes" })}
                 </div>
             </div>
         </section>
          </TabsContent>
          <TabsContent value="parents">
            {/* === Section: Parents & Guardians === */}
            <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Parent & Guardian Information</h2>
            <div className="space-y-8"> {/* Increased spacing between parent sections */}

                 {/* --- Mother's Information --- */}
                 <div className="space-y-4"> {/* Reduced internal spacing */}
                     <h3 className="font-medium text-md">Mother's Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                         {renderField("mother_full_name", { label: "Mother's Full Name", fieldtype: "Data", reqd: 1 })}
                         {renderField("mother_phone", { label: "Mother's Phone", fieldtype: "Phone", reqd: 1 })}
                         {renderField("mother_email", { label: "Mother's Email", fieldtype: "Data", options: "Email" })}
                         {renderField("mother_occupation", { label: "Mother's Occupation", fieldtype: "Data" })}
                         {renderField("mother_education", { label: "Mother's Education", fieldtype: "Data" })}
                         {/* Add more mother fields here */}
                     </div>
                 </div>

                 {/* --- Father's Information --- */}
                  <div className="space-y-4 pt-6 border-t"> {/* Reduced internal spacing, added border */}
                     <h3 className="font-medium text-md">Father's Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                         {renderField("father_full_name", { label: "Father's Full Name", fieldtype: "Data", reqd: 1 })}
                         {renderField("father_phone", { label: "Father's Phone", fieldtype: "Phone", reqd: 1 })}
                         {renderField("father_email", { label: "Father's Email", fieldtype: "Data", options: "Email" })}
                         {renderField("father_occupation", { label: "Father's Occupation", fieldtype: "Data" })}
                         {renderField("father_education", { label: "Father's Education", fieldtype: "Data" })}
                          {/* Add more father fields here */}
                     </div>
                 </div>

                 {/* --- Marital Status & Divorce Details --- */}
                  <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                     {renderField("parent_marital_status", { label: "Parent Marital Status", fieldtype: "Select", options: "\nMarried\nSeparated\nDivorced\nSingle Parent", reqd: 1 })}
                     {/* Conditional Divorce Fields */}
                     {watchMaritalStatus === 'Divorced' && renderField("who_is_responsible_for_paying_applicants_tuition_fee", { label: "Who pays tuition fee?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced" })} {/* Fixed typo */}
                     {watchMaritalStatus === 'Divorced' && renderField("court_order_document", { label: "Court Order Document", fieldtype: "Attach", mandatory_depends_on: "Divorced" })}
                     {watchMaritalStatus === 'Divorced' && renderField("who_is_allowed_to_receive_school_communication", { label: "Who receives communication?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced" })}
                     {watchMaritalStatus === 'Divorced' && renderField("who_is_allowed_to_receive_report_cards", { label: "Who receives report cards?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced" })}
                     {watchMaritalStatus === 'Divorced' && renderField("visit_rights", { label: "Who can visit child?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced" })}
                     {watchMaritalStatus === 'Divorced' && renderField("legal_rights_document", { label: "Legal Rights Document", fieldtype: "Attach", mandatory_depends_on: "Divorced" })}
                </div>

                {/* --- Guardian Info --- */}
                <div className="pt-6 border-t space-y-4">
                     <h3 className="font-medium text-md">Guardian Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                         {renderField("parents_are_guardians", { label: "Are Parents the Local Guardians?", fieldtype: "Select", options: "\nYes\nNo" })}
                         {/* Keep or remove guardian_information renderField call */}
                         {/* {watchParentsAreGuardians === 'No' && renderField("guardian_information", { label: "Guardian Details", fieldtype: "Table", options: "IHS Student Applicant Guardian", mandatory_depends_on: "No" })} */}
                         {/* OR, if using individual guardian fields: */}
                         {/* {watchParentsAreGuardians === 'No' && renderField("guardian_full_name", { label: "Guardian Full Name", fieldtype: "Data", mandatory_depends_on: "No" })} */}
                         {/* ... etc ... */}
                      </div>
                </div>
            </div>
        </section>
            {/* === Section: Preferences & More (Conditional - Class XI) === */}
            {watchAppliedFor === 'Class XI' && (
              <section className="space-y-6">
                 <h2 className="text-xl font-semibold border-b pb-2">Subject Preferences & Additional Questions (Class XI)</h2>
                 <div className="space-y-6">
                     <h3 className="font-medium text-md">Subject Selection</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4"> {/* Adjusted sm grid */}
                         {renderField("group_a", { label: "Group A", fieldtype: "Select", options: "\nPhysics\nAccounts\nHistory", mandatory_depends_on: "Class XI" })}
                         {renderField("group_b", { label: "Group B", fieldtype: "Select", options: "\nChemistry\nEconomics", mandatory_depends_on: "Class XI" })}
                         {renderField("group_c", { label: "Group C", fieldtype: "Select", options: "\nBiology\nComputer Science\nCommerce\nPolitical Science", mandatory_depends_on: "Class XI" })}
                         {renderField("group_d", { label: "Group D", fieldtype: "Select", options: "\nMathematics\nEnvironmental Studies\nFine Arts", mandatory_depends_on: "Class XI" })}
                     </div>

                     {/* Applicant Questions */}
                     <h3 className="font-medium text-md pt-4 border-t mt-4">Applicant Responses</h3>
                      <div className="space-y-4">
                         {/* TODO: Add actual question text as description/label */}
                         {renderField("q1_applicant_response", { label: "Question 1 Response (Applicant)", fieldtype: "Small Text" })}
                         {renderField("q2_applicant_response", { label: "Question 2 Response (Applicant)", fieldtype: "Small Text" })}
                         {renderField("q3_applicant_response", { label: "Question 3 Response (Applicant)", fieldtype: "Small Text" })}
                         {renderField("q4_applicant_response", { label: "Question 4 Response (Applicant)", fieldtype: "Small Text" })}
                         {renderField("q5_applicant_response", { label: "Question 5 Response (Applicant)", fieldtype: "Small Text" })}
                         {renderField("q6_applicant_response", { label: "Question 6 Response (Applicant)", fieldtype: "Small Text" })}
                         {renderField("q7_applicant_response", { label: "Question 7 Response (Applicant)", fieldtype: "Small Text" })}
                     </div>

                      {/* Parent Questions */}
                      <h3 className="font-medium text-md pt-4 border-t mt-4">Parent Responses</h3>
                      <div className="space-y-4">
                         {/* TODO: Add actual question text */}
                         {renderField("q1_parent_response", { label: "Question 1 Response (Parent)", fieldtype: "Small Text" })}
                         {renderField("q2_parent_response", { label: "Question 2 Response (Parent)", fieldtype: "Small Text" })}
                         {renderField("q3_parent_response", { label: "Question 3 Response (Parent)", fieldtype: "Small Text" })}
                         {renderField("q4_parent_response", { label: "Question 4 Response (Parent)", fieldtype: "Small Text" })}
                         {renderField("q5_parent_response", { label: "Question 5 Response (Parent)", fieldtype: "Small Text" })}
                         {renderField("q6_parent_response", { label: "Question 6 Response (Parent)", fieldtype: "Small Text" })}
                     </div>
                 </div>
             </section>
            )}
          </TabsContent>
          <TabsContent value="declaration">
            {/* === Section: Declaration === */}
            <section className="space-y-6 pt-6 border-t">
             <h2 className="text-xl font-semibold border-b pb-2">Declaration</h2>
              {/* Add Declaration Text Here */}
              <p className="text-sm text-muted-foreground">
                 [Declaration Text Block - Needs to be added based on actual requirements]
                 I hereby declare that the information provided is true and correct to the best of my knowledge...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-center"> {/* Center items vertically */}
                 {/* Checkbox needs custom label handling within renderField */}
                 {renderField("tnc_check", { label: "I agree to the terms and conditions.", fieldtype: "Check", mandatory_depends_on:"eval:doc.date" })}
                 {renderField("date", { label: "Date", fieldtype: "Date", reqd: 1 })}
                 {renderField("place", { label: "Place", fieldtype: "Data", reqd: 1 })}
              </div>
         </section>
          </TabsContent>
          <TabsContent value="billing">
            {/* === Section: Application Fees === */}
            <section className="space-y-6">
             <h2 className="text-xl font-semibold border-b pb-2">Application Fees & Billing</h2>
             <div className="space-y-6">
                 <h3 className="font-medium text-md">Billing Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                     {renderField("billing_name", { label: "Billing Full Name", fieldtype: "Data", reqd: 1 })}
                     {renderField("billing_phone", { label: "Billing Phone", fieldtype: "Phone", reqd: 1 })}
                     {renderField("billing_email", { label: "Billing Email", fieldtype: "Data", options: "Email", reqd: 1 })}
                     {renderField("billing_address_l1", { label: "Billing Address Line 1", fieldtype: "Data", reqd: 1 })}
                     {renderField("billing_address_l2", { label: "Billing Address Line 2", fieldtype: "Data" })}
                     {renderField("billing_city", { label: "Billing City/ Town", fieldtype: "Data", reqd: 1 })}
                     {renderField("billing_state", { label: "Billing State", fieldtype: "Data" })}
                     {renderField("billing_area_code", { label: "Billing Area Code/ Pincode", fieldtype: "Data", reqd: 1 })}
                     {renderField("billing_country", { label: "Billing Country", fieldtype: "Link", options: "Country", reqd: 1 })}
                 </div>

                 {/* Payment Status (Read-only section) */}
                 <h3 className="font-medium text-md pt-4 border-t mt-4 opacity-70">Payment Status (Read Only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 opacity-70 pointer-events-none">
                    {renderField("application_fee_status", { label: "Fee Status", fieldtype: "Select", options: "Pending\nIn Progress\nCompleted\nExpired", read_only: 1 })}
                    {renderField("program", { label: "Program", fieldtype: "Link", options: "Program", read_only: 1 })}
                    {/* Conditionally render or remove payment links table */}
                    {/* {renderField("payment_program_links", { label: "Payment Links", fieldtype: "Table", options: "Payment Program Link", read_only: 1 })} */}
                  </div>
             </div>
        </section>
          </TabsContent>
          {isLastTab && (
            <div className="flex justify-end pt-8 mt-8 border-t">
              <Button type="submit" size="lg">
              {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          )}
        </form>
        {/* Navigation Buttons OUTSIDE the form to prevent accidental submit */}
        {tab !== "instruction" && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 mt-8 border-t">
            <Button type="button" variant="outline" onClick={() => setTab(TAB_KEYS[tabIndex - 1])} disabled={isFirstTab}>
              Back
            </Button>
            {!isLastTab && (
              <Button type="button" onClick={() => setTab(TAB_KEYS[tabIndex + 1])}>
                Next
              </Button>
            )}
          </div>
        )}
      </Tabs>
    </Form>
  );
}