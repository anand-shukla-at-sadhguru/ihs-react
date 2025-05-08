// src/schemas/admissionRegistrationSchema.ts
import { z } from 'zod';

// Helper to create Zod unions from Frappe Select options string (more robust than z.enum)
const createEnumSchema = (optionsString: string | null | undefined) => {
  if (!optionsString) return z.string().optional().or(z.literal('')); // Allow empty string for optional selects
  const options = optionsString.split('\n').map(o => o.trim()).filter(o => o.length > 0);
  if (options.length === 0) return z.string().optional().or(z.literal(''));

  // Create an array of Zod literals from the options
  const literals = options.map(opt => z.literal(opt));

  // Use z.union for flexibility (handles single options, allows empty string for optional)
  // The '.or(z.string().max(0))' allows an empty string selection if the field isn't strictly required by .refine() later
  // Use `as any` to satisfy the type requirement for z.union which needs at least two members initially.
  return z.union(literals as any).or(z.literal('')).optional();
};

// --- Main Admission Schema ---
export const admissionRegistrationSchema = z.object({
  // Application Details
  application_year: z.string().min(1, { message: 'Application Academic Year is required.' }), // Example: Treat Link as string ID
  applied_for: z.string().min(1, { message: 'Applied For is required.' }), // Link to IHS Admission Grade (string ID)
  applicant_user: z.string().optional(), // Link to User (string ID)

  // Previous Application
  applied_to_ihs_before: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please select if you applied before.' }),
  // --> Conditional Fields for Previous Application
  previous_application_application_year: z.string().optional(), // Link to IHS Academic Year (string ID)
  previous_application_applied_for: z.string().optional(), // Link to IHS Admission Grade (string ID)
  previous_application_remarks: z.string().optional(),

  // Personal Information
  full_name: z.string().min(1, { message: 'Full Name is required.' }),
  gender: createEnumSchema('\nMale\nFemale\nOther').refine(val => val !== undefined && val !== '', { message: 'Gender is required.' }),
  // --> Conditional
  other_gender: z.string().optional(),
  nationality: z.string().min(1, { message: 'Nationality is required.' }), // Link to Country (string ID/Name)
  country_of_residence: z.string().min(1, { message: 'Country of Residence is required.' }), // Link to Country (string ID/Name)
  country: z.string().min(1, { message: 'Country of Birth is required.' }), // Link to Country (string ID/Name)
  date_of_birth: z.string() // Use string for date input initially, refine for format/validity
      .min(1, { message: 'Date of Birth is required.' })
      .refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format (YYYY-MM-DD)' }) // Basic format check
      .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date value' }),
  age: z.string().optional(), // Often calculated, keep optional

  // Communication Address
  comm_address_country: z.string().min(1, { message: 'Country is required.' }),
  comm_address_area_code: z.string().min(1, { message: 'Area Code/ Pincode is required.' }),
  comm_address_line_1: z.string().min(1, { message: 'Address Line 1 is required.' }),
  comm_address_line_2: z.string().optional(),
  comm_address_city: z.string().min(1, { message: 'City/ Town is required.' }),
  comm_address_state: z.string().min(1, { message: 'State is required.' }),

  // Other Personal Information
  identification_mark_1: z.string().min(1, { message: 'Identification Mark 1 is required.' }),
  religion: createEnumSchema('\nHindu\nMuslim\nChristian\nSikh\nJew\nOther').refine(val => val !== undefined && val !== '', { message: 'Religion is required.' }),
  community: createEnumSchema('\nOC\nBC\nBC-Others\nMBC\nSC-Arunthathiyar\nSC-Others\nDNC (Denotified Communities)\nST\nOther').refine(val => val !== undefined && val !== '', { message: 'Community is required.' }),
  identification_mark_2: z.string().min(1, { message: 'Identification Mark 2 is required.' }),
  // --> Conditional
  other_religion: z.string().optional(),
  other_community: z.string().optional(),

  // Languages
  mother_tongue: z.string().min(1, { message: 'Mother Tongue is required.' }),
  // --> Conditional
  second_language: z.string().optional(), // Link to IHS Admission Second Language (string ID)
  third_language: z.string().optional(), // Link to IHS Admission Third Language (string ID)
  // Table field kept for now, adjust if needed
  optional_language_table: z.array(z.object({ /* Define fields */ }).optional()).optional(),

  // Sibling Information (Individual Fields)
  has_sibling_in_ihs: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant has sibling(s) in IHS.' }),
  // --> Conditional Sibling Fields (Add more like sibling_2_full_name etc. if needed)
  sibling_1_full_name: z.string().optional(),
  sibling_1_grade_status: z.string().optional().describe("e.g., 'Studying in Class V', 'Completed Class XII'"), // Example description
  sibling_1_school_name: z.string().optional().describe("If studying in IHS"),

  // Supporting Documents (Using z.any() for files, refine validation as needed)
  recent_photograph: z.any().optional().refine(file => !!file, { message: 'Recent Photograph is required.' }),
  birth_certificate: z.any().optional().refine(file => !!file, { message: 'Birth Certificate is required.' }),
  id_proof: createEnumSchema('\nAadhaar Card\nPassport').refine(val => val !== undefined && val !== '', { message: 'ID Proof type is required.' }),
  id_proof_document: z.any().optional().refine(file => !!file, { message: 'ID Proof Document is required.' }),
  // --> Conditional ID Proof Details
  aadhaar_number: z.string().optional(),
  passport_number: z.string().optional(),
  place_of_issue: z.string().optional(),
  date_of_issue: z.string().optional()
      .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format (YYYY-MM-DD)' })
      .refine(val => !val || !isNaN(Date.parse(val)), { message: 'Invalid date value' }),
  date_of_expiry: z.string().optional()
      .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format (YYYY-MM-DD)' })
      .refine(val => !val || !isNaN(Date.parse(val)), { message: 'Invalid date value' }),

  // Academics Tab ---------------------
  // Current School Information
  is_home_schooled: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant is home schooled.' }),
  // --> Conditional Current School Fields
  current_school_name: z.string().optional(),
  board_affiliation: z.string().optional(), // Link to IHS Board Affiliation (string ID)
  board_affiliation_data2: z.string().optional(), // Frappe sometimes has redundant fields, clarify which one to use
  phone_number: z.string().optional(), // Phone type
  current_school_country: z.string().optional(), // Link to Country (string ID/Name)
  current_school_area_code: z.string().optional(),
  current_school_city: z.string().optional(),
  current_school_state: z.string().optional(),
  email_address: z.string().email({ message: "Invalid email format." }).optional(), // Email type
  current_school_a_line1: z.string().optional(),
  current_school_a_line2: z.string().optional(),

  // Previous School Information
  was_the_applicant_ever_home_schooled: createEnumSchema('\nYes\nNo').optional(), // Conditionally visible Select
  been_to_school_previously: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant studied previously.' }),
  // Table field kept for now, adjust if needed
  previous_schools: z.array(z.object({ /* Define fields */ }).optional()).optional(),
  // --> Conditional Additional Info
  emis_id: z.string().optional(),

  // More Information (Academics)
  academic_strengths_and_weaknesses: z.string().min(1, { message: 'Academic Strengths and Weaknesses are required.' }),
  hobbies_interests_and_extra_curricular_activities: z.string().min(1, { message: 'Hobbies, Interests and Extra-Curricular Activities are required.' }),
  other_details_of_importance: z.string().optional(),
  temperament_and_personality: z.string().min(1, { message: 'Temperament and Personality are required.' }),
  special_learning_needs_or_learning_disability: z.string().min(1, { message: 'Special Learning Needs or Learning Disability information is required.' }),

  // Health Tab --------------------------
  // Basic Health Information (Vaccines)
  done_smallpox_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Smallpox vaccine status required.' }),
  done_hepatitis_a_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Hepatitis A vaccine status required.' }),
  done_hepatitis_b_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Hepatitis B vaccine status required.' }),
  done_tdap_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Tdap vaccine status required.' }),
  done_typhoid_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Typhoid vaccine status required.' }),
  done_measles_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Measles vaccine status required.' }),
  done_polio_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Polio vaccine status required.' }),
  done_mumps_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Mumps vaccine status required.' }),
  done_rubella_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Rubella vaccine status required.' }),
  done_varicella_vaccine: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Varicella vaccine status required.' }),
  other_vaccines: z.string().optional(),
  vaccine_certificates: z.any().optional().refine(file => !!file, { message: 'Vaccine Certificate(s) are required.' }),

  // Additional Health Information
  blood_group: createEnumSchema('\nBlood Group A+\nBlood Group A-\nBlood Group B+\nBlood Group B-\nBlood Group O+\nBlood Group O-\nBlood Group AB+\nBlood Group AB-').refine(val => val !== undefined && val !== '', { message: 'Blood Group is required.' }),
  wears_glasses_or_lens: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant wears glasses/lenses.' }),
  // --> Conditional Eye Power
  right_eye_power: z.string().optional(),
  left_eye_power: z.string().optional(),
  // --> Conditional Hygiene Training (For Class II)
  is_toilet_trained: createEnumSchema('\nYes\nNo').optional(),
  wets_bed: createEnumSchema('\nYes\nNo').optional(),

  // Physical and Mental Health Information
  has_hearing_challenges: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding hearing challenges.' }),
  hearing_challenges: z.string().optional(),
  has_behavioural_challenges: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding behavioural challenges.' }),
  behavioural_challenges: z.string().optional(), // Fixed typo
  has_physical_challenges: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding physical challenges.' }),
  physical_challenges: z.string().optional(),
  has_speech_challenges: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding speech challenges.' }),
  speech_challenges: z.string().optional(),

  // Other Medical Information
  has_injury: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding history of injury.' }),
  injury_details: z.string().optional(),
  on_medication: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding regular medication.' }),
  medication_details: z.string().optional(), // Fixed typo
  medical_prescription: z.any().optional(), // File upload, conditional
  has_health_issue: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding history of health issues.' }),
  health_issue_details: z.string().optional(),
  was_hospitalized: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding history of hospitalization.' }),
  hospitalization_details: z.string().optional(),
  needs_special_attention: createEnumSchema('\nYes\nNo').optional(),
  attention_details: z.string().optional(),

  // Allergies
  has_allergies: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding allergies.' }), // Fixed typo
  allergy_details: z.string().optional(),

  // Parents & Guardians Tab (Individual Fields) -------------
  // --> Mother's Details
  mother_full_name: z.string().min(1, "Mother's Full Name is required."),
  mother_email: z.string().email({ message: "Invalid email format." }).optional(),
  mother_phone: z.string().min(1, "Mother's Phone Number is required."),
  mother_occupation: z.string().optional(),
  mother_education: z.string().optional(),
  // Add other mother fields as needed from the 'IHS Student Applicant Parent' DocType

  // --> Father's Details
  father_full_name: z.string().min(1, "Father's Full Name is required."),
  father_email: z.string().email({ message: "Invalid email format." }).optional(),
  father_phone: z.string().min(1, "Father's Phone Number is required."),
  father_occupation: z.string().optional(),
  father_education: z.string().optional(),
  // Add other father fields as needed

  parent_marital_status: createEnumSchema('\nMarried\nSeparated\nDivorced\nSingle Parent').refine(val => val !== undefined && val !== '', { message: 'Parent Marital Status is required.' }),
  // --> Conditional Divorce Details
  who_is_responsible_for_paying_applicants_tuition_fee: createEnumSchema('\nFather\nMother\nBoth').optional(), // Fixed typo
  court_order_document: z.any().optional(), // File upload, conditional
  who_is_allowed_to_receive_school_communication: createEnumSchema('\nFather\nMother\nBoth').optional(),
  legal_rights_document: z.any().optional(), // File upload, conditional
  who_is_allowed_to_receive_report_cards: createEnumSchema('\nFather\nMother\nBoth').optional(),
  visit_rights: createEnumSchema('\nFather\nMother\nBoth').optional(),

  // Guardian Information (Kept as table for now, modify if needed)
  parents_are_guardians: createEnumSchema('\nYes\nNo').optional(),
  guardian_information: z.array(z.object({ /* Define fields */ }).optional()).optional(), // Table Field

  // Preferences and More Tab (Conditional on Class XI) ----------
  group_a: createEnumSchema('\nPhysics\nAccounts\nHistory').optional(),
  group_c: createEnumSchema('\nBiology\nComputer Science\nCommerce\nPolitical Science').optional(),
  group_b: createEnumSchema('\nChemistry\nEconomics').optional(),
  group_d: createEnumSchema('\nMathematics\nEnvironmental Studies\nFine Arts').optional(),
  // Question Responses
  q1_applicant_response: z.string().optional(),
  q2_applicant_response: z.string().optional(),
  q3_applicant_response: z.string().optional(),
  q4_applicant_response: z.string().optional(),
  q5_applicant_response: z.string().optional(),
  q6_applicant_response: z.string().optional(),
  q7_applicant_response: z.string().optional(),
  q1_parent_response: z.string().optional(),
  q2_parent_response: z.string().optional(),
  q3_parent_response: z.string().optional(),
  q4_parent_response: z.string().optional(),
  q5_parent_response: z.string().optional(),
  q6_parent_response: z.string().optional(),

  // Declaration
  // Use z.literal(true) for required checkboxes
  tnc_check: z.boolean().optional(), // Keep optional for now, refine logic in superRefine
  date: z.string() // Use string for date input initially
      .min(1, { message: 'Date is required.' })
      .refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format (YYYY-MM-DD)' })
      .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date value' }),
  place: z.string().min(1, { message: 'Place is required.' }),

  // Application Fees Tab -------------------
  // Billing Details
  billing_name: z.string().min(1, { message: 'Billing Full Name is required.' }),
  billing_phone: z.string().min(1, { message: 'Billing Phone is required.' }),
  billing_email: z.string().min(1, { message: 'Billing Email is required.' }).email({ message: 'Invalid Billing Email format.' }),
  billing_country: z.string().min(1, { message: 'Billing Country is required.' }), // Link to Country (string ID/Name)
  billing_area_code: z.string().min(1, { message: 'Billing Area Code/ Pincode is required.' }),
  billing_city: z.string().min(1, { message: 'Billing City/ Town is required.' }),
  billing_state: z.string().optional(), // State seems optional here
  billing_address_l1: z.string().min(1, { message: 'Billing Address Line 1 is required.' }),
  billing_address_l2: z.string().optional(),

  // Payment Transaction (Read-only or system-set usually)
  application_fee_status: createEnumSchema('Pending\nIn Progress\nCompleted\nExpired').optional(),
  program: z.string().optional(), // Link to Program, default exists
  // Table field kept for now, adjust if needed
  payment_program_links: z.array(z.object({ /* Define fields */ }).optional()).optional(),

  // Amended From (Read-only)
  amended_from: z.string().optional(), // Link

  // Evaluation Tab (Internal use usually)
  application_feedback_status: createEnumSchema('\nYes\nMaybe\nNo').optional(),
  application_feedback: z.string().optional(),
  orientation_feedback_status: createEnumSchema('\nYes\nMaybe\nNo').optional(),
  academics_feedback: z.string().optional(),
  group_activities_feedback: z.string().optional(),
  sports_feedback: z.string().optional(),
  dining: z.string().optional(),
  other_feedback: z.string().optional(),
  interview_feedback_status: createEnumSchema('\nProbable Yes\nProbable No\nDefinite Yes\nDefinite No').optional(),
  interview_feedback: z.string().optional(),

})
.superRefine((data, ctx) => {
    // --- Conditional Requirements ---

    // Previous Application Details
    if (data.applied_to_ihs_before === 'Yes') {
        if (!data.previous_application_application_year) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previous_application_application_year'], message: 'Previous Application Year is required.' });
        if (!data.previous_application_applied_for) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previous_application_applied_for'], message: 'Previously Applied For grade is required.' });
    }

    // Other Gender/Religion/Community
    if (data.gender === 'Other' && !data.other_gender) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['other_gender'], message: 'Please specify gender.' });
    }
    if (data.religion === 'Other' && !data.other_religion) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['other_religion'], message: 'Please specify religion.' });
    }
    if (data.community === 'Other' && !data.other_community) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['other_community'], message: 'Please specify community.' });
    }

    // Languages based on 'Applied For'
    // Ensure applied_for value matches exactly the option string from Frappe
    if ((data.applied_for === 'Class V' || data.applied_for === 'Class VIII') && !data.second_language) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['second_language'], message: 'Second Language is required for the selected grade.' });
    }
    if (data.applied_for === 'Class VIII' && !data.third_language) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['third_language'], message: 'Third Language is required for the selected grade.' });
    }

    // Sibling Details (Using individual fields)
    if (data.has_sibling_in_ihs === 'Yes') {
        if (!data.sibling_1_full_name) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sibling_1_full_name'], message: "Sibling's Full Name is required." });
        if (!data.sibling_1_grade_status) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sibling_1_grade_status'], message: "Sibling's Grade/Status is required." });
        // Add checks for sibling_1_school_name if mandatory when 'Yes'
    }

    // ID Proof Details
    if (data.id_proof === 'Aadhaar Card' && !data.aadhaar_number) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['aadhaar_number'], message: 'Aadhaar Number is required.' });
    }
    if (data.id_proof === 'Passport') {
        if (!data.passport_number) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['passport_number'], message: 'Passport Number is required.' });
        if (!data.place_of_issue) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['place_of_issue'], message: 'Place of Issue is required.' });
        if (!data.date_of_issue) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date_of_issue'], message: 'Date of Issue is required.' });
        // Check if date_of_issue is valid before checking expiry if needed
        if (!data.date_of_expiry) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date_of_expiry'], message: 'Date of Expiry is required.' });
    }

    // Current School Details
    if (data.is_home_schooled === 'No') {
        if (!data.current_school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_name'], message: 'School Name is required.' });
        // Check one of the board fields - assuming board_affiliation_data2 is the one to use
        if (!data.board_affiliation_data2) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['board_affiliation_data2'], message: 'Board Affiliation is required.' });
        if (!data.phone_number) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone_number'], message: 'School Phone Number is required.' });
        if (!data.current_school_country) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_country'], message: 'School Country is required.' });
        if (!data.current_school_city) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_city'], message: 'School City/ Town is required.' });
        if (!data.email_address) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email_address'], message: 'School Email Address is required.' });
        if (!data.current_school_a_line1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_a_line1'], message: 'School Address Line 1 is required.' });
        // Conditional select 'was_the_applicant_ever_home_schooled'
        if (data.was_the_applicant_ever_home_schooled === undefined || data.was_the_applicant_ever_home_schooled === '') {
             ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['was_the_applicant_ever_home_schooled'], message: 'Please specify if applicant was ever home schooled.' });
        }
    }

    // Previous Schools Table (Keep if table is used)
    // if (data.been_to_school_previously === 'Yes' && (!data.previous_schools || data.previous_schools.length === 0)) {
    //      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previous_schools'], message: 'Please provide details for at least one previous school.' });
    // }

    // Eye Power
    if (data.wears_glasses_or_lens === 'Yes') {
        if (!data.right_eye_power) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['right_eye_power'], message: 'Right Eye Power is required.' });
        if (!data.left_eye_power) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['left_eye_power'], message: 'Left Eye Power is required.' });
    }

    // Hygiene Training (Class II)
    if (data.applied_for === 'Class II') { // Ensure exact match with Frappe option
         if (data.is_toilet_trained === undefined || data.is_toilet_trained === '') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['is_toilet_trained'], message: 'Toilet training status is required for Class II.' });
         if (data.wets_bed === undefined || data.wets_bed === '') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['wets_bed'], message: 'Bed-wetting status is required for Class II.' });
    }

    // Health Challenge Details
    if (data.has_hearing_challenges === 'Yes' && !data.hearing_challenges) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hearing_challenges'], message: 'Please provide details about hearing challenges.' });
    if (data.has_behavioural_challenges === 'Yes' && !data.behavioural_challenges) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['behavioural_challenges'], message: 'Please provide details about behavioural challenges.' }); // Fixed typo
    if (data.has_physical_challenges === 'Yes' && !data.physical_challenges) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['physical_challenges'], message: 'Please provide details about physical challenges.' });
    if (data.has_speech_challenges === 'Yes' && !data.speech_challenges) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['speech_challenges'], message: 'Please provide details about speech challenges.' });

    // Other Medical Details
    if (data.has_injury === 'Yes' && !data.injury_details) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['injury_details'], message: 'Please provide details about the injury/accident.' });
    if (data.on_medication === 'Yes') {
        if (!data.medication_details) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['medication_details'], message: 'Please provide details about the medication.' }); // Fixed typo
        if (!data.medical_prescription) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['medical_prescription'], message: 'Medical Prescription attachment is required.' });
    }
    if (data.has_health_issue === 'Yes' && !data.health_issue_details) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['health_issue_details'], message: 'Please provide details about the health issue.' });
    if (data.was_hospitalized === 'Yes' && !data.hospitalization_details) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hospitalization_details'], message: 'Please provide details about the hospitalization.' });
    if (data.needs_special_attention === 'Yes' && !data.attention_details) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['attention_details'], message: 'Please provide details about the special attention needed.' });
    if (data.has_allergies === 'Yes' && !data.allergy_details) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['allergy_details'], message: 'Please provide details about the allergies.' }); // Fixed typo

    // Divorce Details
    if (data.parent_marital_status === 'Divorced') {
        if (!data.who_is_responsible_for_paying_applicants_tuition_fee) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['who_is_responsible_for_paying_applicants_tuition_fee'], message: 'Please specify who pays tuition fees.' }); // Fixed typo
        if (!data.court_order_document) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['court_order_document'], message: 'Court Order attachment is required.' });
        if (!data.who_is_allowed_to_receive_school_communication) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['who_is_allowed_to_receive_school_communication'], message: 'Please specify who receives communication.' });
        if (!data.legal_rights_document) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['legal_rights_document'], message: 'Legal Rights attachment is required.' });
        if (!data.who_is_allowed_to_receive_report_cards) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['who_is_allowed_to_receive_report_cards'], message: 'Please specify who receives report cards.' });
        if (!data.visit_rights) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['visit_rights'], message: 'Please specify who can visit the child.' });
    }

    // Guardian Table (Keep if table is used)
    // if (data.parents_are_guardians === 'No' && (!data.guardian_information || data.guardian_information.length === 0)) {
    //     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_information'], message: 'Please provide details for at least one guardian.' });
    // }

    // Class XI Subject Preferences
    if (data.applied_for === 'Class XI') { // Ensure exact match with Frappe option
        if (!data.group_a) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['group_a'], message: 'Group A subject selection is required.' });
        if (!data.group_b) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['group_b'], message: 'Group B subject selection is required.' });
        if (!data.group_c) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['group_c'], message: 'Group C subject selection is required.' });
        if (!data.group_d) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['group_d'], message: 'Group D subject selection is required.' });
    }

    // T&C Checkbox (Example: required if date is filled)
    if (data.date && !data.tnc_check) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tnc_check'], message: 'Please agree to the declaration.' });
    }

});

// Infer the TypeScript type
export type AdmissionRegistrationFormData = z.infer<typeof admissionRegistrationSchema>;