// src/schemas/admissionRegistrationSchema.ts
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
// Helper to create Zod unions from Frappe Select options string (more robust than z.enum)

// File validation helper
const fileSchema = z
  .any()
  .refine(
    (file) => {
      if (!file) return false;
      // Accept FileList or single File
      const f = file instanceof File ? file : (file?.[0] instanceof File ? file[0] : null);
      if (!f) return false;
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      const extAllowed = allowedTypes.includes(f.type);
      const sizeAllowed = f.size <= 5 * 1024 * 1024;
      return extAllowed && sizeAllowed;
    },
    {
      message:
        "File must be .pdf, .jpg, .jpeg, or .png and not exceed 5MB.",
    }
  );

// Textarea (max 200 chars)
const textareaSchema = z
  .string()
  .max(200, { message: "Maximum 200 characters allowed." })
  .min(1, { message: "This field is required." });

// Helper to get last N academic years as strings (e.g., "2023-24")
const getLastNAcademicYears = (n: number): string[] => {
  const years: string[] = [];
  const now = new Date();
  let year = now.getFullYear();
  for (let i = 0; i < n; i++) {
    const nextYear = (year + 1).toString().slice(-2);
    years.push(`${year}-${nextYear}`);
    year--;
  }
  return years;
};

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

const currentYear = new Date().getFullYear();

const e164PhoneSchema = z.string()
  .refine(value => {
    if (!value || value.trim() === '') return true; // Allow empty for optional fields
    return isValidPhoneNumber(value);
  }, {
    message: "Invalid phone number format. Please include country code.",
  });

// Helper for required E.164 phone numbers
const requiredE164PhoneSchema = e164PhoneSchema.refine(
  value => value && value.trim() !== '',
  { message: "Phone number is required." }
);

const languageProficiencyLevels = ['Native', 'Advanced', 'Intermediate', 'Basic'] as const;
const knownLanguagesList = ['English', 'Tamil', 'Hindi', 'French', 'German', 'Spanish', 'Arabic', 'Mandarin', 'Japanese', 'Other'] as const;
export const individualLanguageSchema = z.object({
  language: z.enum(knownLanguagesList, {
    required_error: "Please select a language.",
  }),
  proficiency: z.enum(languageProficiencyLevels, {
    required_error: "Please select proficiency.",
  }),
  other_language_name: z.string().optional(), // New field for specifying "Other"
})
  .superRefine((data, ctx) => {
    if (data.language === 'Other') {
      if (!data.other_language_name || data.other_language_name.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['other_language_name'], // Error will be shown on this field
          message: 'Please specify the language name.',
        });
      }
    }
  });
export type IndividualLanguageData = z.infer<typeof individualLanguageSchema>;

// --- Define Schema for Individual Sibling Entry ---
const individualSiblingSchema = z.object({
  sibling_first_name: z.string().min(1, "Sibling's First Name is required."),
  sibling_last_name: z.string().min(1, "Sibling's Last Name is required."),
  sibling_roll_number: z.string().min(1, "Sibling's Roll Number is required."),
  sibling_date_of_birth: z.string() // Using string for date input, can refine further
    .min(1, { message: "Sibling's Date of Birth is required." })
    .refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format (YYYY-MM-DD)' })
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date value' })
    .refine(val => {
      const d = new Date(val);
      const now = new Date();
      return d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, { message: "Sibling's Date of Birth must be in the past." }),
  sibling_gender: createEnumSchema('\nMale\nFemale\nOther').refine(val => val !== undefined && val !== '', { message: "Sibling's Gender is required." }),
});
export type IndividualSiblingData = z.infer<typeof individualSiblingSchema>;

const classLevelOptions = ['LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'] as const;
const boardAffiliationOptions = "CBSE – Central Board of Secondary Education\nICSE - Indian Certificate of Secondary Education\nSSC - Secondary School Certificate\nIB - International Baccalaureate\nCambridge International\nState Board\nOther";
const individualPreviousSchoolSchema = z.object({
  prev_school_name: z.string().min(1, "School Name is required."),
  prev_school_board_affiliation: createEnumSchema(boardAffiliationOptions).refine(val => val !== undefined && val !== '', { message: "Board Affiliation is required." }),
  prev_school_from_year: z.number({ invalid_type_error: "From Year must be a number.", required_error: "From Year is required." })
    .int({ message: "From Year must be a whole number." })
    .min(2000, { message: "From Year must be 2000 or later." })
    .max(currentYear, { message: `From Year cannot be later than ${currentYear}.` }),
  prev_school_to_year: z.number({ invalid_type_error: "To Year must be a number.", required_error: "To Year is required." })
    .int({ message: "To Year must be a whole number." })
    .min(2000, { message: "To Year must be 2000 or later." })
    .max(currentYear, { message: `To Year cannot be later than ${currentYear}.` }),
  prev_school_from_class: z.enum(classLevelOptions, { required_error: "From Class is required." }),
  prev_school_to_class: z.enum(classLevelOptions, { required_error: "To Class is required." }),
  prev_school_country: z.string().min(1, "Country is required."),
  prev_school_zip_code: z.string().min(1, "Zipcode is required.")
    .regex(/^[a-zA-Z0-9\s-]{3,20}$/, { message: "Invalid zipcode format." }), // Basic zipcode regex
  prev_school_report_card: fileSchema.refine(file => file !== undefined && file !== null, { message: "Report card is required." }), // Make file required
  // prev_school_other_board_affiliation: z.string().optional(), // If 'Other' board selected
}).superRefine((data, ctx) => {
  // To Year must be >= From Year
  if (data.prev_school_from_year && data.prev_school_to_year && data.prev_school_to_year < data.prev_school_from_year) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['prev_school_to_year'],
      message: 'To Year must be greater than or equal to From Year.',
    });
  }
  // To Class must be >= From Class (assuming classLevelOptions is ordered)
  if (data.prev_school_from_class && data.prev_school_to_class) {
    const fromClassIndex = classLevelOptions.indexOf(data.prev_school_from_class);
    const toClassIndex = classLevelOptions.indexOf(data.prev_school_to_class);
    if (toClassIndex < fromClassIndex) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prev_school_to_class'],
        message: 'To Class must be the same as or later than From Class.',
      });
    }
  }
  // If board is 'Other', then 'prev_school_other_board_affiliation' could be made required
  // if (data.prev_school_board_affiliation === 'Other' && (!data.prev_school_other_board_affiliation || data.prev_school_other_board_affiliation.trim() === '')) {
  //   ctx.addIssue({ ... path: ['prev_school_other_board_affiliation'] ... });
  // }
});
export type IndividualPreviousSchoolData = z.infer<typeof individualPreviousSchoolSchema>;

const previousApplicationYears = getLastNAcademicYears(5);
const appliedForEnum = ['Class II', 'Class V', 'Class VIII', 'Class XI'] as const;

const PARENT_RELATION_OPTIONS = ['Father', 'Mother'] as const;
const PARENT_EDUCATION_LEVEL_OPTIONS_STRING = "Class VIII or below\nSSLC/ PUC\nHigher Secondary\nGraduate\nPost-Graduate\nM. Phil\nPhD\nPost-Doctoral";
const PARENT_PROFESSION_OPTIONS_STRING = "Academia-Professors, Research Scholars, Scientists\nArts, Music, Entertainment\nArchitecture and Construction\nAgriculture\nArmed Forces\nBanking and Finance and Financial Services\nBusinessman/ Entrepreneur\nEducation and Training\nInformation Technology\nHealthcare\nOthers";

// --- Schema for an Individual Parent Detail ---
export const individualParentDetailSchema = z.object({
  // Basic Information
  parent_first_name: z.string().min(1, "Parent's First Name is required."),
  parent_last_name: z.string().min(1, "Parent's Last Name is required."),
  parent_relation: z.enum(PARENT_RELATION_OPTIONS, { required_error: "Parent's Relation is required." }),
  parent_nationality: z.string().min(1, "Parent's Nationality is required."),
  parent_country_of_residence: z.string().min(1, "Parent's Country of Residence is required."),

  // Contact Information (per parent)
  parent_contact_email: z.string().email("Invalid email format.").min(1, "Parent's Contact Email is required."),
  parent_contact_phone: requiredE164PhoneSchema,
  parent_is_whatsapp_same: z.boolean().default(true),
  parent_whatsapp_number: e164PhoneSchema.optional(),

  // Parent Address
  parent_is_address_same_as_applicant: createEnumSchema('Yes\nNo').refine(val => val !== undefined && val !== '', { message: "Please specify if address is same as applicant's communication address." }),

  // Parent Address Details (Conditional)
  parent_address_country: z.string().optional(),
  parent_address_zipcode: z.string().regex(/^[a-zA-Z0-9\s-]{3,20}$/, { message: "Invalid zipcode format." }).optional(),
  parent_address_state: z.string().optional(),
  parent_address_city: z.string().optional(),
  parent_address_line1: z.string().optional(),
  parent_address_line2: z.string().optional(), // User marked M, will be required if parent_is_address_same_as_applicant is No

  // Educational Information
  parent_education: createEnumSchema(PARENT_EDUCATION_LEVEL_OPTIONS_STRING).refine(val => val !== undefined && val !== '', { message: "Parent's Education level is required." }),
  parent_field_of_study: z.string().min(1, "Field of Study is required."),

  // Professional Information
  parent_profession: createEnumSchema(PARENT_PROFESSION_OPTIONS_STRING).refine(val => val !== undefined && val !== '', { message: "Parent's Profession is required." }),
  parent_organization_name: z.string().min(1, "Organization Name is required."),
  parent_designation: z.string().min(1, "Designation is required."),
  parent_annual_income: z.string()
    .regex(/^\d+$/, "Annual Income must contain only digits.")
    .min(1, "Annual Income is required."),
}).superRefine((data, ctx) => {
  if (data.parent_is_whatsapp_same === false) {
    if (!data.parent_whatsapp_number || data.parent_whatsapp_number.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_whatsapp_number'], message: 'WhatsApp Number is required.' });
    } else if (data.parent_whatsapp_number && !isValidPhoneNumber(data.parent_whatsapp_number)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_whatsapp_number'], message: 'Invalid WhatsApp number format.' });
    }
  }
  if (data.parent_is_address_same_as_applicant === 'No') {
    if (!data.parent_address_country) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_country'], message: "Country is required for parent's address." });
    if (!data.parent_address_zipcode) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_zipcode'], message: "Zipcode is required for parent's address." });
    // else if (!/^[a-zA-Z0-9\s-]{3,20}$/.test(data.parent_address_zipcode) ) { // Already handled by field regex
    //     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_zipcode'], message: "Invalid zipcode format for parent's address." });
    // }
    if (!data.parent_address_state) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_state'], message: "State is required for parent's address." });
    if (!data.parent_address_city) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_city'], message: "City is required for parent's address." });
    if (!data.parent_address_line1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_line1'], message: "Address Line 1 is required for parent's address." });
    if (!data.parent_address_line2) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parent_address_line2'], message: "Address Line 2 is required for parent's address." });
  }
});
export type IndividualParentDetailData = z.infer<typeof individualParentDetailSchema>;

const GUARDIAN_RELATION_OPTIONS_STRING = "Grand Father\nGrand Mother\nSibling\nUncle\nAunt\nFamily Friend\nOther";
export const individualGuardianDetailSchema = z.object({
  // Basic Information
  guardian_relation_with_applicant: createEnumSchema(GUARDIAN_RELATION_OPTIONS_STRING).refine(val => val !== undefined && val !== '', { message: "Guardian's Relation with Applicant is required." }),
  guardian_first_name: z.string().min(1, "Guardian's First Name is required."),
  guardian_last_name: z.string().min(1, "Guardian's Last Name is required."),
  guardian_nationality: z.string().min(1, "Guardian's Nationality is required."),
  guardian_country_of_residence: z.string().min(1, "Guardian's Country of Residence is required."),

  // Contact Information
  guardian_contact_email: z.string().email("Invalid email format.").min(1, "Guardian's Contact Email is required."),
  guardian_contact_phone: requiredE164PhoneSchema,
  guardian_is_whatsapp_same: z.boolean().default(true),
  guardian_whatsapp_number: e164PhoneSchema.optional(),

  // Guardian Address
  guardian_is_address_same_as_applicant: createEnumSchema('Yes\nNo').refine(val => val !== undefined && val !== '', { message: "Please specify if address is same as applicant's communication address." }),

  // Guardian Address Details (Conditional)
  guardian_address_country: z.string().optional(),
  guardian_address_zipcode: z.string().regex(/^[a-zA-Z0-9\s-]{3,20}$/, { message: "Invalid zipcode format." }).optional(),
  guardian_address_state: z.string().optional(),
  guardian_address_city: z.string().optional(),
  guardian_address_line1: z.string().optional(),
  guardian_address_line2: z.string().optional(), // Marked M by user

  // Educational Information
  guardian_education: createEnumSchema(PARENT_EDUCATION_LEVEL_OPTIONS_STRING).refine(val => val !== undefined && val !== '', { message: "Guardian's Education level is required." }),
  guardian_field_of_study: z.string().min(1, "Field of Study is required."),

  // Professional Information - EXCLUDED FOR NOW as per your field list for guardian. Add if needed.

}).superRefine((data, ctx) => {
  // Conditional: WhatsApp Number
  if (data.guardian_is_whatsapp_same === false) {
    if (!data.guardian_whatsapp_number || data.guardian_whatsapp_number.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_whatsapp_number'], message: "Guardian's WhatsApp Number is required." });
    } else if (data.guardian_whatsapp_number && !isValidPhoneNumber(data.guardian_whatsapp_number)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_whatsapp_number'], message: "Invalid Guardian's WhatsApp number format." });
    }
  }
  // Conditional: Guardian Address Details
  if (data.guardian_is_address_same_as_applicant === 'No') {
    if (!data.guardian_address_country) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_address_country'], message: "Country is required for guardian's address." });
    if (!data.guardian_address_zipcode) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_address_zipcode'], message: "Zipcode is required for guardian's address." });
    if (!data.guardian_address_state) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_address_state'], message: "State is required for guardian's address." });
    if (!data.guardian_address_city) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_address_city'], message: "City is required for guardian's address." });
    if (!data.guardian_address_line1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_address_line1'], message: "Address Line 1 is required for guardian's address." });
    if (!data.guardian_address_line2) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardian_address_line2'], message: "Address Line 2 is required for guardian's address." });
  }
});
export type IndividualGuardianDetailData = z.infer<typeof individualGuardianDetailSchema>;
// --- Main Admission Schema ---
export const admissionRegistrationSchema = z.object({
  // Application Details
  application_year: z.string().min(1, { message: 'Application Academic Year is required.' }), // Example: Treat Link as string ID
  applied_for: z.enum(['Class II', 'Class V', 'Class VIII', 'Class XI'], { message: 'Applied For is required.' }), // Link to IHS Admission Grade (string ID)
  applicant_user: z.string().optional(), // Link to User (string ID)

  // Previous Application
  applied_to_ihs_before: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please select if you applied before.' }),
  // --> Conditional Fields for Previous Application
  previous_application_application_year: z.enum(previousApplicationYears as [string, ...string[]], { message: 'Previous Application Year is required.' }).optional(),
  previous_application_applied_for: z.enum(appliedForEnum, { message: 'Previously Applied For grade is required.' }).optional(),
  previous_application_remarks: z.string().optional(),

  // Personal Information
  first_name: z.string().min(1, { message: 'First Name is required.' }),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, { message: 'Last Name is required.' }),
  age: z.number({ invalid_type_error: 'Age must be a number.' })
    .min(3, { message: 'Age must be at least 3.' })
    .max(100, { message: 'Age must be at most 100.' }),
  gender: createEnumSchema('\nMale\nFemale\nOther').refine(val => val !== undefined && val !== '', { message: 'Gender is required.' }),
  other_gender: z.string().optional(),
  nationality: z.string().min(1, { message: 'Nationality is required.' }), // Link to Country (string ID/Name)
  country_of_residence: z.string().min(1, { message: 'Country of Residence is required.' }), // Link to Country (string ID/Name)
  country: z.string().min(1, { message: 'Country of Birth is required.' }), // Link to Country (string ID/Name)
  date_of_birth: z
    .string()
    .min(1, { message: 'Date of Birth is required.' })
    .refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format (YYYY-MM-DD)' })
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date value' })
    .refine(val => {
      const d = new Date(val);
      const now = new Date();
      // Only allow strictly past dates (not today)
      return d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, { message: 'Date of Birth must be in the past.' }),

  // Communication Address
  comm_address_country: z.string().min(1, { message: 'Country is required.' }),
  comm_address_area_code: z.string().min(1, { message: "Area Code/ Pincode is required." })
    .regex(/^\d{4,9}$/, { message: 'Area Code/ Pincode must be a number between 5 and 9 digits.' }),
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
  // Table field kept for now, adjust if needed
  languages_known: z.array(individualLanguageSchema)
    .min(1, { message: "Please add at least one language." }),

  // Sibling Information (Individual Fields)
  has_sibling_in_ihs: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant has sibling(s) in IHS.' }),
  // --- NEW: Student Siblings Table ---
  student_siblings: z.array(individualSiblingSchema).optional(), // Array will be required conditionally
  // Supporting Documents (Using z.any() for files, refine validation as needed)
  recent_photograph: fileSchema.refine(file => file !== undefined && file !== null, { message: "Recent Photograph is required." }),
  birth_certificate: fileSchema.refine(file => file !== undefined && file !== null, { message: "Birth Certificate is required." }),
  id_proof: createEnumSchema('\nAadhaar Card\nPassport').refine(val => val !== undefined && val !== '', { message: 'ID Proof type is required.' }),
  id_proof_document: fileSchema.refine(file => file !== undefined && file !== null, { message: "ID Proof Document is required." }),
  // --> Conditional ID Proof Details
  aadhaar_number: z.string()
    .length(12, { message: "Aadhaar Number must be exactly 12 digits." })
    .regex(/^\d+$/, { message: "Aadhaar Number must contain only digits." })
    .optional(),
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
  current_school_board_affiliation: createEnumSchema('\nCBSE\nICSE\nSSC').optional(), // Now a dropdown
  current_school_phone_number: e164PhoneSchema.optional(), // Phone type
  current_school_country: z.string().optional(), // Link to Country (string ID/Name)
  current_school_area_code: z.string().optional(),
  current_school_city: z.string().optional(),
  current_school_state: z.string().optional(),
  current_school_email_address: z.string().email({ message: "Invalid email format." }).optional(), // Email type
  current_school_a_line1: z.string().optional(),
  current_school_a_line2: z.string().optional(),

  // Previous School Information
  was_the_applicant_ever_home_schooled: createEnumSchema('\nYes\nNo').optional(), // Conditionally visible Select
  been_to_school_previously: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant studied previously.' }),
  // --- Conditional Previous School Fields ---
  // --- NEW: Previous Schools Table ---
  previous_schools: z.array(individualPreviousSchoolSchema).optional(),
  // --> Conditional Additional Info
  emis_id: z.string().optional(),

  // More Information (Academics)
  academic_strengths_and_weaknesses: textareaSchema,
  hobbies_interests_and_extra_curricular_activities: textareaSchema,
  other_details_of_importance: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  temperament_and_personality: textareaSchema,
  special_learning_needs_or_learning_disability: textareaSchema,

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
  vaccine_certificates: fileSchema.optional(),

  // Additional Health Information
  blood_group: createEnumSchema('\nBlood Group A+\nBlood Group A-\nBlood Group B+\nBlood Group B-\nBlood Group O+\nBlood Group O-\nBlood Group AB+\nBlood Group AB-').refine(val => val !== undefined && val !== '', { message: 'Blood Group is required.' }),
  wears_glasses_or_lens: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if applicant wears glasses/lenses.' }),
  // --> Conditional Eye Power
  right_eye_power: z.string().optional(),
  left_eye_power: z.string().optional(),
  // --> Conditional Hygiene Training (For Class II)
  is_toilet_trained: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if the applicant is toilet trained.' }),
  wets_bed: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify if the applicant wets the bed.' }),
  bed_wet_frequency: z.string().optional(), // Details if wets_bed is 'Yes'

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
  medical_prescription: fileSchema.optional(), // File upload, conditional
  has_health_issue: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding history of health issues.' }),
  health_issue_details: z.string().optional(),
  was_hospitalized: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding history of hospitalization.' }),
  hospitalization_details: z.string().optional(),
  needs_special_attention: createEnumSchema('\nYes\nNo').optional(),
  attention_details: z.string().optional(),

  // Allergies
  has_allergies: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: 'Please specify regarding allergies.' }), // Fixed typo
  allergy_details: z.string().optional(),

  // --- NEW: Students Parents Table ---
  students_parents: z.array(individualParentDetailSchema)
    .min(1, "At least one parent's details (Father/Mother) are required.")
    .max(2, "A maximum of two parent entries (Father/Mother) are allowed."),

  parent_marital_status: createEnumSchema('\nMarried\nSeparated\nDivorced\nSingle Parent').refine(val => val !== undefined && val !== '', { message: 'Parent Marital Status is required.' }),
  // --> Conditional Divorce Details
  who_is_responsible_for_paying_applicants_tuition_fee: createEnumSchema('\nFather\nMother\nBoth').optional(), // Fixed typo
  court_order_document: fileSchema.optional(), // File upload, conditional
  who_is_allowed_to_receive_school_communication: createEnumSchema('\nFather\nMother\nBoth').optional(),
  legal_rights_document: fileSchema.optional(), // File upload, conditional
  who_is_allowed_to_receive_report_cards: createEnumSchema('\nFather\nMother\nBoth').optional(),
  visit_rights: createEnumSchema('\nFather\nMother\nBoth').optional(),

  // Guardian Information (Kept as table for now, modify if needed)
  parents_are_local_guardians: createEnumSchema('\nYes\nNo').refine(val => val !== undefined && val !== '', { message: "Please specify if parents are the local guardians." }), // Changed field name slightly for clarity
  // guardian_information: z.array(z.object({ /* Define fields */ }).optional()).optional(),
  student_guardians: z.array(individualGuardianDetailSchema).optional(),

  // Preferences and More Tab (Conditional on Class XI) ----------
  group_a: createEnumSchema('\nPhysics\nAccounts\nHistory').optional(),
  group_c: createEnumSchema('\nBiology\nComputer Science\nCommerce\nPolitical Science').optional(),
  group_b: createEnumSchema('\nChemistry\nEconomics').optional(),
  group_d: createEnumSchema('\nMathematics\nEnvironmental Studies\nFine Arts').optional(),
  // Question Responses
  q1_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q2_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q3_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q4_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q5_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q6_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q7_applicant_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q1_parent_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q2_parent_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q3_parent_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q4_parent_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q5_parent_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),
  q6_parent_response: z.string().max(200, { message: "Maximum 200 characters allowed." }).optional(),

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
  billing_phone: requiredE164PhoneSchema,
  billing_email: z.string().email({ message: 'Invalid Billing Email format.' }),
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
    // Previous Application Details
    if (data.applied_to_ihs_before === 'Yes') {
      if (!data.previous_application_application_year) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previous_application_application_year'], message: 'Previous Application Year is required.' });
      if (!data.previous_application_applied_for) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previous_application_applied_for'], message: 'Previously Applied For grade is required.' });
    }


    console.error("----------------------------------------------------------");
    console.error("--- FULL SCHEMA (HEAVILY COMMENTED): SUPER REFINE EXECUTED ---");
    console.error("FULL SCHEMA (HEAVILY COMMENTED): Received data:", JSON.parse(JSON.stringify(data)));
    console.error("----------------------------------------------------------");

    console.warn(`FULL SCHEMA (HEAVILY COMMENTED): Gender Check - data.gender: "${data.gender}", data.other_gender: "${data.other_gender}"`);
    const otherGenderIsEmpty = (!data.other_gender || data.other_gender.trim() === '');
    console.warn(`FULL SCHEMA (HEAVILY COMMENTED): Gender Conditions - (data.gender === 'Other') is ${data.gender === 'Other'}, (otherGenderIsEmpty) is ${otherGenderIsEmpty}`);

    if (data.gender === 'Other' && otherGenderIsEmpty) {
      console.error("--- FULL SCHEMA (HEAVILY COMMENTED): ADDING 'other_gender' ERROR ---");
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['other_gender'], message: 'Please specify gender (from FULL schema - HEAVILY COMMENTED).' });
    }
    // ... other checks ...;
    if (data.religion === 'Other' && !data.other_religion) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['other_religion'], message: 'Please specify religion.' });
    }
    if (data.community === 'Other' && !data.other_community) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['other_community'], message: 'Please specify community.' });
    }

    // --- NEW: Conditional Requirement for student_siblings table ---
    if (data.has_sibling_in_ihs === 'Yes') {
      if (!data.student_siblings || data.student_siblings.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['student_siblings'], // Attach error to the array field itself
          message: "Please provide details for at least one sibling."
        });
      }
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
      // Require board_affiliation (dropdown) instead of board_affiliation_data2
      if (!data.current_school_board_affiliation) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_board_affiliation'], message: 'Board Affiliation is required.' });
      if (data.is_home_schooled === 'No') {
        if (!data.current_school_phone_number || data.current_school_phone_number.trim() === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_phone_number'], message: 'School Phone Number is required.' });
        } else if (!isValidPhoneNumber(data.current_school_phone_number)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_phone_number'], message: 'Invalid School Phone Number format.' });
        }
        // ... other current school conditional checks
      }
      if (!data.current_school_country) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_country'], message: 'School Country is required.' });
      if (!data.current_school_city) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_city'], message: 'School City/ Town is required.' });
      if (!data.current_school_email_address) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_email_address'], message: 'School Email Address is required.' });
      if (!data.current_school_a_line1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['current_school_a_line1'], message: 'School Address Line 1 is required.' });
      // Conditional select 'was_the_applicant_ever_home_schooled'
      if (data.was_the_applicant_ever_home_schooled === undefined || data.was_the_applicant_ever_home_schooled === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['was_the_applicant_ever_home_schooled'], message: 'Please specify if applicant was ever home schooled.' });
      }
    }

    // Eye Power
    if (data.wears_glasses_or_lens === 'Yes') {
      if (!data.right_eye_power) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['right_eye_power'], message: 'Right Eye Power is required.' });
      if (!data.left_eye_power) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['left_eye_power'], message: 'Left Eye Power is required.' });
    }

    // Hygiene Training (Class II)
    if (data.applied_for === 'Class II') { // Ensure exact match with Frappe option
      if (data.is_toilet_trained === undefined || data.is_toilet_trained === '') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['is_toilet_trained'], message: 'Toilet training status is required for Class II.' });
      if (data.wets_bed === undefined || data.wets_bed === '') ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['wets_bed'], message: 'Bed-wetting status is required for Class II.' });
      if (data.wets_bed === 'Yes' && (!data.bed_wet_frequency || data.bed_wet_frequency.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bed_wet_frequency'],
          message: 'Please provide bed wetting frequency details.'
        });
      }
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

    if (data.students_parents && data.students_parents.length === 2) {
      if (data.students_parents[0].parent_relation === data.students_parents[1].parent_relation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['students_parents', 1, 'parent_relation'], // Error on the second parent's relation
          message: "Parent relations must be unique (e.g., one Father, one Mother)."
        });
      }
    }

    if (data.parents_are_local_guardians === 'No') {
      if (!data.student_guardians || data.student_guardians.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['student_guardian'], // Attach error to the array field itself
          message: "Please provide details for at least one local guardian if parents are not the local guardians."
        });
      }
      // Zod will automatically validate each item in the student_guardian array against individualGuardianDetailSchema
    }
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
    console.error("--- FULL SCHEMA: SUPER REFINE FINISHED ---");
    console.error("----------------------------------------------------------");
  });
console.log(
  "%cSCHEMA EXPORT CHECK (HEAVILY COMMENTED): admissionRegistrationSchema._def.effect?.type IS:",
  "color: blue; font-weight: bold;",
  admissionRegistrationSchema._def.effect?.type
);
// Infer the TypeScript type
export type AdmissionRegistrationFormData = z.infer<typeof admissionRegistrationSchema>;