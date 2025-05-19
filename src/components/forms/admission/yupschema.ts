// src/schemas/admissionRegistrationSchemaYup.ts
import * as yup from 'yup';
// Assuming you keep this
import {
    ACCEPTABLE_FILE_TYPES_YUP,
    APPLIED_FOR_OPTIONS_YUP,
    BIOLOGY_CS_COMMERCE_POLSCI_OPTIONS,
    BLOOD_GROUP_OPTIONS_YUP,
    BOARD_OPTIONS_YUP,
    CHEMISTRY_ECONOMICS_OPTIONS,
    CLASS_LEVEL_OPTIONS_YUP,
    COMMUNITY_OPTIONS_YUP,
    currentYear,
    FATHER_MOTHER_BOTH_OPTIONS_YUP,
    GENDER_OPTIONS_YUP,
    GUARDIAN_RELATION_OPTIONS_YUP,
    ID_PROOF_OPTIONS_YUP,
    LANGUAGE_OPTIONS_YUP,
    LANGUAGE_PROFICIENCY_YUP,
    MATH_ENV_FINEARTS_OPTIONS,
    MAX_FILE_SIZE_BYTES_YUP,
    MAX_FILE_SIZE_MB_YUP,
    PARENT_EDUCATION_LEVEL_OPTIONS_YUP,
    PARENT_MARITAL_STATUS_OPTIONS_YUP,
    PARENT_PROFESSION_OPTIONS_YUP,
    PARENT_RELATION_OPTIONS_YUP,
    PHYSICS_ACCOUNTS_HISTORY_OPTIONS,
    PREVIOUS_APP_YEAR_OPTIONS_YUP,
    RELIGION_OPTIONS_YUP,
    YES_NO_OPTIONS_YUP,
    yupE164Phone
}
    from './admissionFormTabUtils';

export const yupFileSchema = (required = false, requiredMsg = "File is required.") => {
    let schema = yup.mixed<File>() // For File objects
        .test(
            "fileSize",
            `File size should be less than ${MAX_FILE_SIZE_MB_YUP}MB.`,
            (value) => {
                if (!value || !(value instanceof File)) return true;
                return value.size <= MAX_FILE_SIZE_BYTES_YUP;
            }
        )
        .test(
            "fileType",
            `Invalid file type. Accepted: ${ACCEPTABLE_FILE_TYPES_YUP.join(', ')}.`,
            (value) => {
                if (!value || !(value instanceof File)) return true;
                return ACCEPTABLE_FILE_TYPES_YUP.includes(value.type);
            }
        );

    if (required) {
        // Ensure that the value is an instance of File and not just any truthy value
        schema = schema.test("is-present-and-file", requiredMsg, value => value instanceof File);
    }
    return schema.nullable(); // Allow null if not required
};
// --- Yup Helper Functions (You'll need to create/adapt these) ---

// Example: Yup Helper for Phone


// --- Yup Schemas for Array Items (Example for Languages) ---
export const individualLanguageSchemaYup = yup.object().shape({
    language: yup.string().oneOf(LANGUAGE_OPTIONS_YUP, 'Invalid language.').required("Please select a language."),
    proficiency: yup.string().oneOf(LANGUAGE_PROFICIENCY_YUP, 'Invalid proficiency.').required("Please select proficiency."),
    other_language_name: yup.string().when('language', { // THIS IS THE FIELD TO USE
        is: 'Other',
        then: schema => schema.required('Please specify the language name.').min(1),
        otherwise: schema => schema.optional().nullable().transform(() => undefined),
    }),
});

export type IndividualLanguageDataYup = yup.InferType<typeof individualLanguageSchemaYup>;
// export type IndividualLanguageDataYup = yup.InferType<typeof individualLanguageSchemaYup>; // For type inference

// --- Yup Schemas for Sibling, PreviousSchool, Parent, Guardian (You need to create these) ---
// Example Sibling:
const individualSiblingSchemaYup = yup.object().shape({
    sibling_first_name: yup.string().required("Sibling's First Name is required."),
    sibling_last_name: yup.string().required("Sibling's Last Name is required."),
    sibling_roll_number: yup.string().required("Sibling's Roll Number is required."),
    sibling_date_of_birth: yup.date()
        .typeError('Invalid date format for sibling.')
        .required("Sibling's Date of Birth is required.")
        .max(new Date(new Date().setDate(new Date().getDate() - 1)), "Sibling's Date of Birth must be in the past."),
    sibling_gender: yup.string().oneOf(GENDER_OPTIONS_YUP, 'Invalid selection.').required("Sibling's Gender is required."),
});
export type IndividualSiblingDataYup = yup.InferType<typeof individualSiblingSchemaYup>;
// Example Previous School:
const individualPreviousSchoolSchemaYup = yup.object().shape({
    prev_school_name: yup.string().required("School Name is required."),
    prev_school_board_affiliation: yup.string().oneOf(BOARD_OPTIONS_YUP, 'Invalid selection.').required("Board Affiliation is required."), // Assuming BOARD_OPTIONS_YUP is defined
    prev_school_from_year: yup.number().typeError("From Year must be a number.").required("From Year is required.")
        .integer("From Year must be a whole number.")
        .min(1980, "From Year must be 1980 or later.")
        .max(currentYear, `From Year cannot be later than ${currentYear}.`),
    prev_school_to_year: yup.number().typeError("To Year must be a number.").required("To Year is required.")
        .integer("To Year must be a whole number.")
        .min(1980, "To Year must be 1980 or later.")
        .max(currentYear, `To Year cannot be later than ${currentYear}.`)
        .test('is-gte-from-year', 'To Year must be greater than or equal to From Year.', function (value) {
            const fromYear = this.parent.prev_school_from_year;
            if (typeof fromYear === 'number' && typeof value === 'number') {
                return value >= fromYear;
            }
            return true; // Let other validations handle if fromYear is not a number
        }),
    prev_school_from_class: yup.string().oneOf(CLASS_LEVEL_OPTIONS_YUP, 'Invalid selection.').required("From Class is required."),
    prev_school_to_class: yup.string().oneOf(CLASS_LEVEL_OPTIONS_YUP, 'Invalid selection.').required("To Class is required.")
        .test('is-gte-from-class', 'To Class must be the same as or later than From Class.', function (value) {
            const fromClass = this.parent.prev_school_from_class;
            if (fromClass && value) {
                return CLASS_LEVEL_OPTIONS_YUP.indexOf(value) >= CLASS_LEVEL_OPTIONS_YUP.indexOf(fromClass);
            }
            return true;
        }),
    prev_school_country: yup.string().required("Country is required."),
    prev_school_zip_code: yup.string().required("Zipcode is required.").matches(/^[a-zA-Z0-9\s-]{3,20}$/, "Invalid zipcode format."),
    prev_school_report_card: yupFileSchema(true, "Report card is required."),
});
export type IndividualPreviousSchoolDataYup = yup.InferType<typeof individualPreviousSchoolSchemaYup>;

// You will need to create individualParentDetailSchemaYup and individualGuardianDetailSchemaYup similarly.
// For parent/guardian address:
const addressFieldsYup = (prefix: string, isAddressRequiredContextField: string) => ({
    [`${prefix}_address_country`]: yup.string().when(isAddressRequiredContextField, {
        is: 'No', then: schema => schema.required(`${prefix.charAt(0).toUpperCase() + prefix.slice(1)} country is required.`),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    [`${prefix}_address_zipcode`]: yup.string().when(isAddressRequiredContextField, {
        is: 'No', then: schema => schema.required(`${prefix.charAt(0).toUpperCase() + prefix.slice(1)} zipcode is required.`).matches(/^[a-zA-Z0-9\s-]{3,20}$/, "Invalid zipcode format."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    // ... and so on for state, city, line1, line2
    [`${prefix}_address_state`]: yup.string().when(isAddressRequiredContextField, {
        is: 'No', then: schema => schema.required('State is required.'), otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    [`${prefix}_address_city`]: yup.string().when(isAddressRequiredContextField, {
        is: 'No', then: schema => schema.required('City is required.'), otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    [`${prefix}_address_line1`]: yup.string().when(isAddressRequiredContextField, {
        is: 'No', then: schema => schema.required('Address Line 1 is required.'), otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    [`${prefix}_address_line2`]: yup.string().optional().nullable().transform(() => undefined),
});

export const individualParentDetailSchemaYup = yup.object().shape({
    parent_first_name: yup.string().required("Parent's First Name is required."),
    parent_last_name: yup.string().required("Parent's Last Name is required."),
    parent_relation: yup.string().oneOf(PARENT_RELATION_OPTIONS_YUP).required("Parent's Relation is required."),
    parent_nationality: yup.string().required("Parent's Nationality is required."),
    parent_country_of_residence: yup.string().required("Parent's Country of Residence is required."),
    parent_contact_email: yup.string().email("Invalid email format.").required("Parent's Contact Email is required."),
    parent_contact_phone: yupE164Phone(true),
    parent_is_whatsapp_same: yup.boolean().default(true),
    parent_whatsapp_number: yupE164Phone().when('parent_is_whatsapp_same', {
        is: false, then: schema => schema.required('WhatsApp Number is required if different.'),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    parent_is_address_same_as_applicant: yup.string().oneOf(YES_NO_OPTIONS_YUP).required("Please specify if address is same."),
    ...addressFieldsYup('parent', 'parent_is_address_same_as_applicant'),
    parent_education: yup.string().oneOf(PARENT_EDUCATION_LEVEL_OPTIONS_YUP).required("Parent's Education level is required."),
    parent_field_of_study: yup.string().required("Field of Study is required."),
    parent_profession: yup.string().oneOf(PARENT_PROFESSION_OPTIONS_YUP).required("Parent's Profession is required."),
    parent_organization_name: yup.string().required("Organization Name is required."),
    parent_designation: yup.string().required("Designation is required."),
    parent_annual_income: yup.string().required("Annual Income is required.").matches(/^\d+$/, "Annual Income must contain only digits."),
});
export type IndividualParentDetailDataYup = yup.InferType<typeof individualParentDetailSchemaYup>;


export const individualGuardianDetailSchemaYup = yup.object().shape({
    guardian_relation_with_applicant: yup.string()
        .transform(value => value === "" ? undefined : value) // <--- ADD OR ENSURE THIS TRANSFORM IS PRESENT
        .oneOf(GUARDIAN_RELATION_OPTIONS_YUP, "Please select a valid relation.") // Custom .oneOf message
        .required("Guardian's Relation with Applicant is required."),
    guardian_first_name: yup.string().required("Guardian's First Name is required."),
    // ... (similarly for all guardian fields, using addressFieldsYup) ...
    guardian_last_name: yup.string().required("Guardian's Last Name is required."),
    guardian_nationality: yup.string().required("Guardian's Nationality is required."),
    guardian_country_of_residence: yup.string().required("Guardian's Country of Residence is required."),
    guardian_contact_email: yup.string().email().required("Guardian's Email is required."),
    guardian_contact_phone: yupE164Phone(true),
    guardian_is_whatsapp_same: yup.boolean().default(true),
    guardian_whatsapp_number: yupE164Phone().when('guardian_is_whatsapp_same', {
        is: false, then: schema => schema.required("WhatsApp number is required if different."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    guardian_is_address_same_as_applicant: yup.string().oneOf(YES_NO_OPTIONS_YUP).required("Please specify if address is same."),
    ...addressFieldsYup('guardian', 'guardian_is_address_same_as_applicant'),
    guardian_education: yup.string()
        .transform(value => (value === "" || value === null) ? undefined : value) // Transform empty string or null to undefined
        .oneOf(PARENT_EDUCATION_LEVEL_OPTIONS_YUP, "Please select a valid education level.") // Use the centralized constant
        .required("Guardian's Education level is required."), // Your desired "required" message
    guardian_field_of_study: yup.string().required("Guardian's Field of Study is required."),
    guardian_profession: yup.string().oneOf(PARENT_PROFESSION_OPTIONS_YUP).required("Guardian's Profession is required."),
    guardian_organization_name: yup.string().required("Guardian's Organization Name is required."),
    guardian_designation: yup.string().required("Guardian's Designation is required."),
    guardian_annual_income: yup.string()
        .required("Guardian's Annual Income is required.")
        .matches(/^\d+$/, "Annual Income must contain only digits.")
        .min(1, "Annual Income is required."), // min(1) also ensures it's not empty if matches is passed
});

export type IndividualGuardianDetailDataYup = yup.InferType<typeof individualGuardianDetailSchemaYup>;

// --- Main Yup Admission Schema ---
export const admissionRegistrationSchemaYup = yup.object().shape({
    // --- Application Details ---
    application_year: yup.string().required('Application Academic Year is required.'),
    applied_for: yup.string().oneOf(APPLIED_FOR_OPTIONS_YUP, 'Invalid selection.').required('Applied For is required.'),
    applicant_user: yup.string().optional().nullable(),

    // --- Previous Application ---
    applied_to_ihs_before: yup.string().oneOf(YES_NO_OPTIONS_YUP, 'Invalid selection.').required('Please select if you applied before.'),
    previous_application_application_year: yup.string().when('applied_to_ihs_before', ([appliedBefore], schema) => {
        return appliedBefore === 'Yes'
            ? schema.oneOf(PREVIOUS_APP_YEAR_OPTIONS_YUP, 'Invalid year.').required('Previous Application Year is required.')
            : schema.optional().nullable().transform(() => undefined);
    }),
    previous_application_applied_for: yup.string().when('applied_to_ihs_before', ([appliedBefore], schema) => {
        return appliedBefore === 'Yes'
            ? schema.oneOf(APPLIED_FOR_OPTIONS_YUP, 'Invalid grade.').required('Previously Applied For grade is required.')
            : schema.optional().nullable().transform(() => undefined);
    }),
    previous_application_remarks: yup.string().when('applied_to_ihs_before', ([appliedBefore], schema) => {
        return appliedBefore === 'Yes'
            ? schema.required('Previous Application Remarks are required.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),

    // --- Personal Information ---
    first_name: yup.string().required('First Name is required.'),
    middle_name: yup.string().optional().nullable(),
    last_name: yup.string().required('Last Name is required.'),
    gender: yup.string().oneOf(GENDER_OPTIONS_YUP, 'Invalid selection.').required("Gender is required."),
    other_gender: yup.string().when('gender', ([genderVal], schema) => {
        return genderVal === 'Other'
            ? schema.required('Please specify your gender.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    nationality: yup.string().required('Nationality is required.'),
    country_of_residence: yup.string().required('Country of Residence is required.'),
    country: yup.string().required('Country of Birth is required.'), // Country of Birth
    date_of_birth: yup.date()
        .transform((value, originalValue) => originalValue === "" ? null : (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value))
        .nullable()
        .typeError('Invalid date format (YYYY-MM-DD).')
        .required('Date of Birth is required.')
        .max(new Date(new Date().setDate(new Date().getDate() - 1)), 'Date of Birth must be in the past.'),
    age: yup.number() // Assuming age is populated by your form logic, or remove .required() if it can be initially empty
        .typeError('Age must be a number.')
        .required('Age is required.') // Or .optional().nullable() if it can be empty before DOB
        .min(0, 'Age cannot be negative.')
        .integer(),

    // Communication Address
    comm_address_country: yup.string().required('Country is required.'),
    comm_address_area_code: yup.string().required("Area Code/ Pincode is required.")
        .matches(/^\d{4,9}$/, 'Area Code/ Pincode must be between 4 and 9 digits.'),
    comm_address_line_1: yup.string().required('Address Line 1 is required.'),
    comm_address_line_2: yup.string().optional().nullable(),
    comm_address_city: yup.string().required('City/ Town is required.'),
    comm_address_state: yup.string().required('State is required.'),

    // Other Personal Information
    identification_mark_1: yup.string().required('Identification Mark 1 is required.'),
    identification_mark_2: yup.string().required('Identification Mark 2 is required.'),
    religion: yup.string().oneOf(RELIGION_OPTIONS_YUP, 'Invalid selection.').required('Religion is required.'),
    other_religion: yup.string().when('religion', ([religionVal], schema) => {
        return religionVal === 'Other'
            ? schema.required('Please specify religion.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    community: yup.string().oneOf(COMMUNITY_OPTIONS_YUP, 'Invalid selection.').required('Community is required.'),
    other_community: yup.string().when('community', ([communityVal], schema) => {
        return communityVal === 'Other'
            ? schema.required('Please specify community.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),

    // Languages
    mother_tongue: yup.string().oneOf(LANGUAGE_OPTIONS_YUP, 'Invalid selection.').required("Mother Tongue is required."),
    other_mother_tongue: yup.string().when('mother_tongue', ([mtVal], schema) => {
        return mtVal === 'Other'
            ? schema.required('Please specify the mother tongue.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    languages_known: yup.array().of(individualLanguageSchemaYup)
        .min(1, "Please add at least one language known."),

    // Sibling Information
    has_sibling_in_ihs: yup.string().oneOf(YES_NO_OPTIONS_YUP, 'Invalid selection.').required('Please specify if applicant has sibling(s) in IHS.'),
    student_siblings: yup.array().of(individualSiblingSchemaYup).when('has_sibling_in_ihs', ([hasSibling], schema) => {
        return hasSibling === 'Yes'
            ? schema.min(1, "Please provide details for at least one sibling.")
            : schema.optional().transform(() => []); // Clear array if not applicable
    }),

    // Supporting Documents
    recent_photograph: yupFileSchema(true, "Recent Photograph is required."),
    birth_certificate: yupFileSchema(true, "Birth Certificate is required."),
    id_proof: yup.string().oneOf(ID_PROOF_OPTIONS_YUP, 'Invalid selection.').required('ID Proof type is required.'),
    id_proof_document: yupFileSchema(true, "ID Proof Document is required."),
    aadhaar_number: yup.string().when('id_proof', ([idProofVal], schema) => {
        return idProofVal === 'Aadhaar Card'
            ? schema.required('Aadhaar Number is required.').matches(/^\d{12}$/, "Aadhaar Number must be exactly 12 digits.")
            : schema.optional().nullable().transform(() => undefined);
    }),
    passport_number: yup.string().when('id_proof', ([idProofVal], schema) => {
        return idProofVal === 'Passport'
            ? schema.required('Passport Number is required.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    place_of_issue: yup.string().when('id_proof', ([idProofVal], schema) => {
        return idProofVal === 'Passport'
            ? schema.required('Place of Issue is required.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    date_of_issue: yup.date()
        .transform((value, originalValue) => originalValue === "" ? null : (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value))
        .nullable()
        .typeError('Invalid date format for issue date (YYYY-MM-DD).')
        .when('id_proof', ([idProofVal], schema) => {
            return idProofVal === 'Passport'
                ? schema.required('Date of Issue is required.').max(new Date(), "Passport issue date cannot be in the future.")
                : schema.optional().nullable().transform(() => undefined) as yup.DateSchema; // Cast needed due to .when complexity
        }),
    date_of_expiry: yup.date()
        .transform((value, originalValue) => originalValue === "" ? null : (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value))
        .nullable()
        .typeError('Invalid date format for expiry date (YYYY-MM-DD).')
        .when('id_proof', ([idProofVal], schema) => {
            return idProofVal === 'Passport'
                ? schema.required('Date of Expiry is required.')
                    .test(
                        'is-after-issue-date-yup',
                        'Passport expiry date must be after the issue date.',
                        function (value) { // Expiry date
                            const issueDate = this.parent.date_of_issue;
                            if (value instanceof Date && issueDate instanceof Date) {
                                return value > issueDate;
                            }
                            return true; // Let other validations catch if issueDate is not a Date
                        }
                    )
                : schema.optional().nullable().transform(() => undefined) as yup.DateSchema;
        }),

    // --- Academics Tab ---
    is_home_schooled: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Please specify if applicant is home schooled.'),
    current_school_name: yup.string().when('is_home_schooled', { is: 'No', then: _ => _.required("School Name is required."), otherwise: _ => _.optional().nullable().transform(() => undefined) }),
    current_school_board_affiliation: yup.string().when('is_home_schooled', { is: 'No', then: s => s.oneOf(BOARD_OPTIONS_YUP).required("Board Affiliation is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_phone_number: yupE164Phone().when('is_home_schooled', { is: 'No', then: () => yupE164Phone(true, "School Phone is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_country: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School Country is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_area_code: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School Area Code is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_city: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School City is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_state: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School State is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_email_address: yup.string().email("Invalid email.").when('is_home_schooled', { is: 'No', then: s => s.required("School Email is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_a_line1: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School Address Line 1 is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_a_line2: yup.string().optional().nullable(),

    been_to_school_previously: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Please specify if applicant studied previously.'),
    previous_schools: yup.array().of(individualPreviousSchoolSchemaYup).when('been_to_school_previously', {
        is: 'Yes', then: schema => schema.min(1, "Please provide details for at least one previous school."),
        otherwise: schema => schema.optional().transform(() => [])
    }),
    emis_id: yup.string().optional().nullable(),
    academic_strengths_and_weaknesses: yup.string().required().max(200), // Assuming textareaSchema implies required
    hobbies_interests_and_extra_curricular_activities: yup.string().required().max(200),
    other_details_of_importance: yup.string().optional().nullable().max(200),
    temperament_and_personality: yup.string().required().max(200),
    special_learning_needs_or_learning_disability: yup.string().required().max(200),

    // --- Health Tab ---
    // Vaccines
    done_smallpox_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Smallpox vaccine status required.'),
    done_hepatitis_a_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Hepatitis A status required.'),
    done_hepatitis_b_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Hepatitis B status required.'),
    done_tdap_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Tdap status required.'),
    done_typhoid_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Typhoid status required.'),
    done_measles_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Measles status required.'),
    done_polio_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Polio status required.'),
    done_mumps_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Mumps status required.'),
    done_rubella_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Rubella status required.'),
    done_varicella_vaccine: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Varicella status required.'),
    other_vaccines: yup.string().optional().nullable(),
    vaccine_certificates: yupFileSchema(true, "Vaccine Certificate(s) are required."), // Assuming this is mandatory overall

    // Additional Health
    blood_group: yup.string().oneOf(BLOOD_GROUP_OPTIONS_YUP).required('Blood Group is required.'),
    wears_glasses_or_lens: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Please specify if applicant wears glasses/lenses.'),
    right_eye_power: yup.string().when('wears_glasses_or_lens', { is: 'Yes', then: s => s.required("Right Eye Power is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    left_eye_power: yup.string().when('wears_glasses_or_lens', { is: 'Yes', then: s => s.required("Left Eye Power is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // Hygiene for Class II (applied_for is the discriminator)
    is_toilet_trained: yup.string().when('applied_for', { is: 'Class II', then: s => s.oneOf(YES_NO_OPTIONS_YUP).required('Toilet trained status is required for Class II.'), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    wets_bed: yup.string().when('applied_for', { is: 'Class II', then: s => s.oneOf(YES_NO_OPTIONS_YUP).required('Bed wetting status is required for Class II.'), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    bed_wet_frequency: yup.string().when(['applied_for', 'wets_bed'], ([appliedFor, wetsBed], schema) => {
        return appliedFor === 'Class II' && wetsBed === 'Yes' ? schema.required("Bed wet frequency is required.") : schema.optional().nullable().transform(() => undefined);
    }),

    // Challenges
    has_hearing_challenges: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Hearing challenges status required.'),
    hearing_challenges: yup.string().when('has_hearing_challenges', { is: 'Yes', then: s => s.required("Hearing Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_behavioural_challenges: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Behavioural challenges status required.'),
    behavioural_challenges: yup.string().when('has_behavioural_challenges', { is: 'Yes', then: s => s.required("Behavioural Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_physical_challenges: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Physical challenges status required.'),
    physical_challenges: yup.string().when('has_physical_challenges', { is: 'Yes', then: s => s.required("Physical Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_speech_challenges: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Speech challenges status required.'),
    speech_challenges: yup.string().when('has_speech_challenges', { is: 'Yes', then: s => s.required("Speech Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // Medical History
    has_injury: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Injury history status required.'),
    injury_details: yup.string().when('has_injury', { is: 'Yes', then: s => s.required("Injury Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    on_medication: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Medication status required.'),
    medication_details: yup.string().when('on_medication', { is: 'Yes', then: s => s.required("Medication Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    medical_prescription: yupFileSchema().when('on_medication', { is: 'Yes', then: () => yupFileSchema(true, "Medical Prescription is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_health_issue: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Health issue history status required.'),
    health_issue_details: yup.string().when('has_health_issue', { is: 'Yes', then: s => s.required("Health Issue Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    was_hospitalized: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Hospitalization history status required.'),
    hospitalization_details: yup.string().when('was_hospitalized', { is: 'Yes', then: s => s.required("Hospitalization Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    needs_special_attention: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Special attention status required.'), // Assuming this is from createEnumSchema
    attention_details: yup.string().when('needs_special_attention', { is: 'Yes', then: s => s.required("Attention Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_allergies: yup.string().oneOf(YES_NO_OPTIONS_YUP).required('Allergies status required.'),
    allergy_details: yup.string().when('has_allergies', { is: 'Yes', then: s => s.required("Allergy Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // --- Parents Tab ---
    students_parents: yup.array().of(individualParentDetailSchemaYup)
        .min(1, "At least one parent's details are required.")
        .max(2, "A maximum of two parent entries are allowed.")
        .test('unique-parent-relations', 'Parent relations must be unique (e.g., one Father, one Mother).', function (value) {
            if (value && value.length === 2) {
                return value[0]?.parent_relation !== value[1]?.parent_relation;
            }
            return true;
        }),
    parent_marital_status: yup.string().oneOf(PARENT_MARITAL_STATUS_OPTIONS_YUP).required('Parent Marital Status is required.'),
    who_is_responsible_for_paying_applicants_tuition_fee: yup.string().when('parent_marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS_YUP).required("Tuition payer is required for divorced status."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    court_order_document: yupFileSchema().when('parent_marital_status', { is: 'Divorced', then: () => yupFileSchema(true, "Court Order Document is required for divorced status."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    who_is_allowed_to_receive_school_communication: yup.string().when('parent_marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS_YUP).required("Communication receiver is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }), // Assuming options similar to FATHER_MOTHER_BOTH_OPTIONS_YUP
    legal_rights_document: yupFileSchema().when('parent_marital_status', { is: 'Divorced', then: () => yupFileSchema(true, "Legal Rights Document is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    who_is_allowed_to_receive_report_cards: yup.string().when('parent_marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS_YUP).required("Report card receiver is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    visit_rights: yup.string().when('parent_marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS_YUP).required("Visit rights information is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    parents_are_local_guardians: yup.string().oneOf(YES_NO_OPTIONS_YUP).required("Please specify if parents are the local guardians."),
    student_guardians: yup.array().of(individualGuardianDetailSchemaYup).when('parents_are_local_guardians', {
        is: 'No', then: schema => schema.min(1, "Please provide local guardian details if parents are not local guardians."),
        otherwise: schema => schema.optional().transform(() => [])
    }),

    // --- Subjects Tab (Class XI) ---
    group_a: yup.string().when('applied_for', { is: 'Class XI', then: s => s.oneOf(PHYSICS_ACCOUNTS_HISTORY_OPTIONS).required("Group A subject is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    group_b: yup.string().when('applied_for', { is: 'Class XI', then: s => s.oneOf(CHEMISTRY_ECONOMICS_OPTIONS).required("Group B subject is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    group_c: yup.string().when('applied_for', { is: 'Class XI', then: s => s.oneOf(BIOLOGY_CS_COMMERCE_POLSCI_OPTIONS).required("Group C subject is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    group_d: yup.string().when('applied_for', { is: 'Class XI', then: s => s.oneOf(MATH_ENV_FINEARTS_OPTIONS).required("Group D subject is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // Class XI Questions
    q1_applicant_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q2_applicant_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q3_applicant_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q4_applicant_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q5_applicant_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q6_applicant_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q7_applicant_response: yup.string().optional().nullable().max(200), // This one was marked optional

    q1_parent_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q2_parent_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q3_parent_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q4_parent_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q5_parent_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    q6_parent_response: yup.string().when('applied_for', { is: 'Class XI', then: s => s.required("This response is required.").max(200), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // --- Declaration Tab ---
    declaration: yup.boolean().oneOf([true], 'Please agree to the declaration.').required(),
    date: yup.date()
        .transform((value, originalValue) => originalValue === "" ? null : (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value))
        .nullable()
        .typeError('Invalid date format (YYYY-MM-DD).')
        .required('Date is required.'),
    place: yup.string().required('Place is required.'),

    // --- Billing Tab ---
    billing_name: yup.string().required('Billing Full Name is required.'),
    billing_phone: yupE164Phone(true),
    billing_email: yup.string().email('Invalid Billing Email format.').required("Billing Email is required."),
    billing_country: yup.string().required('Billing Country is required.'),
    billing_area_code: yup.string().required('Billing Area Code/ Pincode is required.'),
    billing_city: yup.string().required('Billing City/ Town is required.'),
    billing_state: yup.string().required('Billing State is required.'), // Assuming state is required for billing
    billing_address_l1: yup.string().required('Billing Address Line 1 is required.'),
    billing_address_l2: yup.string().optional().nullable(),

    application_fee_status: yup.string().oneOf(['Pending', 'In Progress', 'Completed', 'Expired'] as const).optional().nullable(),
    amended_from: yup.string().optional().nullable(),

    // Feedback fields (assuming these are optional strings)
    application_feedback_status: yup.string().optional().nullable(),
    application_feedback: yup.string().optional().nullable(),
    orientation_feedback_status: yup.string().optional().nullable(),
    academics_feedback: yup.string().optional().nullable(),
    group_activities_feedback: yup.string().optional().nullable(),
    sports_feedback: yup.string().optional().nullable(),
    dining: yup.string().optional().nullable(),
    other_feedback: yup.string().optional().nullable(),
    interview_feedback_status: yup.string().optional().nullable(),
    interview_feedback: yup.string().optional().nullable(),
    program: yup.string().optional().nullable(),
    // payment_program_links: yup.array().of(yup.object({link_name: yup.string(), link_url: yup.string().url()})).optional().nullable(),


});

// For type inference with Yup
export type AdmissionRegistrationFormDataYup = yup.InferType<typeof admissionRegistrationSchemaYup>;