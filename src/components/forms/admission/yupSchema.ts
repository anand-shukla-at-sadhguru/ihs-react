// src/schemas/admissionRegistrationSchemaYup.ts
import * as yup from 'yup';
// Assuming you keep this
import {
    ACCEPTABLE_FILE_TYPES,
    APPLIED_FOR_OPTIONS,
    BIOLOGY_CS_COMMERCE_POLSCI_OPTIONS,
    BLOOD_GROUP_OPTIONS,
    BOARD_OPTIONS,
    BRANCHS,
    CHEMISTRY_ECONOMICS_OPTIONS,
    CLASS_LEVEL_OPTIONS,
    COMMUNITY_OPTIONS,
    currentYear,
    FATHER_MOTHER_BOTH_OPTIONS,
    GENDER_OPTIONS,
    getLastNAcademicYears,
    GUARDIAN_RELATION_OPTIONS,
    ID_PROOF_OPTIONS,
    LANGUAGE_OPTIONS,
    LANGUAGE_PROFICIENCY,
    MATH_ENV_FINEARTS_OPTIONS,
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_MB,
    PARENT_EDUCATION_LEVEL_OPTIONS,
    PARENT_MARITAL_STATUS_OPTIONS,
    PARENT_PROFESSION_OPTIONS,
    PARENT_RELATION_OPTIONS,
    PHYSICS_ACCOUNTS_HISTORY_OPTIONS,
    RELIGION_OPTIONS,
    YES_NO_OPTIONS,
    yupE164Phone
} from './admissionFormTabUtils';

export const yupFileSchema = (required = false, requiredMsg = "File is required.") => {
    let schema = yup.mixed<File>() // For File objects
        .test(
            "fileSize",
            `File size should be less than ${MAX_FILE_SIZE_MB}MB.`,
            (value) => {
                if (!value || !(value instanceof File)) return true;
                return value.size <= MAX_FILE_SIZE_BYTES;
            }
        )
        .test(
            "fileType",
            `Invalid file type. Accepted: ${ACCEPTABLE_FILE_TYPES.join(', ')}.`,
            (value) => {
                if (!value || !(value instanceof File)) return true;
                return ACCEPTABLE_FILE_TYPES.includes(value.type);
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
    language: yup.string().oneOf(LANGUAGE_OPTIONS, 'Invalid language.').required("Please select a language."),
    proficiency: yup.string().oneOf(LANGUAGE_PROFICIENCY, 'Invalid proficiency.').required("Please select proficiency."),
    other_language: yup.string().when('language', { // THIS IS THE FIELD TO USE
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
    sibling_gender: yup.string().oneOf(GENDER_OPTIONS, 'Invalid selection.').required("Sibling's Gender is required."),
});
export type IndividualSiblingDataYup = yup.InferType<typeof individualSiblingSchemaYup>;
// Example Previous School:
const individualPreviousSchoolSchemaYup = yup.object().shape({
    school_name: yup.string().required("School Name is required."),
    board_affiliation: yup.string().oneOf(BOARD_OPTIONS, 'Invalid selection.').required("Board Affiliation is required."), // Assuming BOARD_OPTIONS is defined
    other_board_affiliation: yup.string() // New field
        .when('board_affiliation', {
            is: 'Other',
            then: schema => schema.required('Please specify the board affiliation.').min(1),
            otherwise: schema => schema.optional().nullable().transform(() => undefined),
        }),
    from_class: yup.string().oneOf(CLASS_LEVEL_OPTIONS, 'Invalid selection.').required("From Class is required."),
    from_year: yup.number().typeError("From Year must be a number.").required("From Year is required.")
        .integer("From Year must be a whole number.")
        .min(1980, "From Year must be 1980 or later.")
        .max(currentYear, `From Year cannot be later than ${currentYear}.`),
    to_year: yup.number().typeError("To Year must be a number.").required("To Year is required.")
        .integer("To Year must be a whole number.")
        .min(1980, "To Year must be 1980 or later.")
        .max(currentYear, `To Year cannot be later than ${currentYear}.`)
        .test('is-gte-from-year', 'To Year must be greater than or equal to From Year.', function (value) {
            const fromYear = this.parent.from_year;
            if (typeof fromYear === 'number' && typeof value === 'number') {
                return value >= fromYear;
            }
            return true; // Let other validations handle if fromYear is not a number
        }),
    to_class: yup.string().oneOf(CLASS_LEVEL_OPTIONS, 'Invalid selection.').required("To Class is required.")
        .test('is-gte-from-class', 'To Class must be the same as or later than From Class.', function (value) {
            const fromClass = this.parent.from_class;
            if (fromClass && value) {
                return CLASS_LEVEL_OPTIONS.indexOf(value) >= CLASS_LEVEL_OPTIONS.indexOf(fromClass);
            }
            return true;
        }),
    country: yup.string().required("Country is required."),
    zip_code: yup.string().required("PIN / ZIP Code is required.").matches(/^[a-zA-Z0-9\s-]{3,20}$/, "Invalid zipcode format."),
    marksheet: yupFileSchema(true, "Report card is required."),
    proof_of_enrolment: yupFileSchema(true, "Proof of Enrolment is required.")
});
export type IndividualPreviousSchoolDataYup = yup.InferType<typeof individualPreviousSchoolSchemaYup>;

// You will need to create individualParentDetailSchemaYup and individualGuardianDetailSchemaYup similarly.
// For parent/guardian address:
export const individualParentDetailSchemaYup = yup.object().shape({
    first_name: yup.string().required("Parent's First Name is required."),
    last_name: yup.string().required("Parent's Last Name is required."),
    relation: yup.string().oneOf(PARENT_RELATION_OPTIONS).required("Parent's Relation is required."),
    nationality: yup.string().required("Parent's Nationality is required."),
    country_of_residence: yup.string().required("Parent's Country of Residence is required."),
    contact_email: yup.string().email("Invalid email format.").required("Parent's Contact Email is required."),
    contact_phone: yupE164Phone(true),
    is_whatsapp_same: yup.boolean().default(true),
    whatsapp_phone: yupE164Phone().when('is_whatsapp_same', {
        is: false, then: schema => schema.required('WhatsApp Number is required if different.'),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    is_address_same_as_applicant: yup.string().oneOf(YES_NO_OPTIONS).required("Please specify if address is same."),
    country: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address country is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    zipcode: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address zipcode is required.")
            .matches(/^[a-zA-Z0-9\s-]{3,20}$/, "Invalid zipcode format."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    state: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address state is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    city: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address city is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    address_line_1: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address line 1 is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    address_line_2: yup.string().optional().nullable().transform(val => val === "" ? null : val),
    education: yup.string().oneOf(PARENT_EDUCATION_LEVEL_OPTIONS).required("Parent's Education level is required."),
    field_of_study: yup.string().required("Field of Study is required."),
    profession: yup.string().oneOf(PARENT_PROFESSION_OPTIONS).required("Parent's Profession is required."),
    organization_name: yup.string().required("Organization Name is required."),
    designation: yup.string().required("Designation is required."),
    annual_income: yup.string().required("Annual Income is required.").matches(/^\d+$/, "Annual Income must contain only digits."),
});
export type IndividualParentDetailDataYup = yup.InferType<typeof individualParentDetailSchemaYup>;


export const individualGuardianDetailSchemaYup = yup.object().shape({
    relation: yup.string()
        .transform(value => value === "" ? undefined : value) // <--- ADD OR ENSURE THIS TRANSFORM IS PRESENT
        .oneOf(GUARDIAN_RELATION_OPTIONS, "Please select a valid relation.") // Custom .oneOf message
        .required("Guardian's Relation with Applicant is required."),
    first_name: yup.string().required("Guardian's First Name is required."),
    // ... (similarly for all guardian fields, using addressFieldsYup) ...
    last_name: yup.string().required("Guardian's Last Name is required."),
    nationality: yup.string().required("Guardian's Nationality is required."),
    country_of_residence: yup.string().required("Guardian's Country of Residence is required."),
    contact_email: yup.string().email().required("Guardian's Email is required."),
    contact_phone: yupE164Phone(true),
    is_whatsapp_same: yup.boolean().default(true),
    whatsapp_phone: yupE164Phone().when('is_whatsapp_same', {
        is: false, then: schema => schema.required("WhatsApp number is required if different."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    is_address_same_as_applicant: yup.string().oneOf(YES_NO_OPTIONS).required("Please specify if address is same."),
    country: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address country is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    zipcode: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address zipcode is required.")
            .matches(/^[a-zA-Z0-9\s-]{3,20}$/, "Invalid zipcode format."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    state: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address state is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    city: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address city is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    address_line_1: yup.string().when('is_address_same_as_applicant', {
        is: 'No',
        then: schema => schema.required("Parent's address line 1 is required."),
        otherwise: schema => schema.optional().nullable().transform(() => undefined)
    }),
    address_line_2: yup.string().optional().nullable().transform(val => val === "" ? null : val),
    education: yup.string()
        .transform(value => (value === "" || value === null) ? undefined : value) // Transform empty string or null to undefined
        .oneOf(PARENT_EDUCATION_LEVEL_OPTIONS, "Please select a valid education level.") // Use the centralized constant
        .required("Guardian's Education level is required."), // Your desired "required" message
    field_of_study: yup.string().required("Guardian's Field of Study is required."),
    profession: yup.string().oneOf(PARENT_PROFESSION_OPTIONS).required("Guardian's Profession is required."),
    organization_name: yup.string().required("Guardian's Organization Name is required."),
    designation: yup.string().required("Guardian's Designation is required."),
    annual_income: yup.string()
        .required("Guardian's Annual Income is required.")
        .matches(/^\d+$/, "Annual Income must contain only digits.")
        .min(1, "Annual Income is required."), // min(1) also ensures it's not empty if matches is passed

});
export type IndividualGuardianDetailDataYup = yup.InferType<typeof individualGuardianDetailSchemaYup>;

// --- Main Yup Admission Schema ---
export const admissionRegistrationSchemaYup = yup.object().shape({
    // --- Application Details ---
    application_academic_year: yup.string().required('Application Academic Year is required.'),
    application_for: yup.string().oneOf(APPLIED_FOR_OPTIONS, 'Invalid selection.').required('Applied For is required.'),
    branch: yup.string().oneOf(BRANCHS, 'Invalid selection.').optional().nullable().transform(() => undefined),
    // --- Previous Application ---
    applied_to_ihs_before: yup.string().oneOf(YES_NO_OPTIONS, 'Invalid selection.').required('Please select if you applied before.'),
    previous_applied_year: yup.string().when('applied_to_ihs_before', ([appliedBefore], schema) => {
        return appliedBefore === 'Yes'
            ? schema.oneOf(getLastNAcademicYears(10), 'Invalid year.').required('Previous Application Year is required.')
            : schema.optional().nullable().transform(() => undefined);
    }),
    previous_applied_for: yup.string().when('applied_to_ihs_before', ([appliedBefore], schema) => {
        return appliedBefore === 'Yes'
            ? schema.oneOf(APPLIED_FOR_OPTIONS, 'Invalid grade.').required('Previously Applied For grade is required.')
            : schema.optional().nullable().transform(() => undefined);
    }),
    previous_applied_comments: yup.string().when('applied_to_ihs_before', ([appliedBefore], schema) => {
        return appliedBefore === 'Yes'
            ? schema.required('Previous Application Remarks are required.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),

    // --- Personal Information ---
    first_name: yup.string().required('First Name is required.'),
    middle_name: yup.string().optional().nullable(),
    last_name: yup.string().required('Last Name is required.'),
    gender: yup.string().oneOf(GENDER_OPTIONS, 'Invalid selection.').required("Gender is required."),
    nationality: yup.string().required('Nationality is required.'),
    country_of_residence: yup.string().required('Country of Residence is required.'),
    country_of_birth: yup.string().required('Country of Birth is required.'), // Country of Birth
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
    country: yup.string().required('Country is required.'),
    zipcode: yup.string().required("Area Code/ Pincode is required.")
        .matches(/^\d{4,9}$/, 'Area Code/ Pincode must be between 4 and 9 digits.'),
    city: yup.string().required('City/ Town is required.'),
    state: yup.string().required('State is required.'),
    address_line_1: yup.string().required('Address Line 1 is required.'),
    address_line_2: yup.string().optional().nullable(),
    // Other Personal Information
    identification_mark_1: yup.string().required('Identification Mark 1 is required.'),
    identification_mark_2: yup.string().required('Identification Mark 2 is required.'),
    religion: yup.string().oneOf(RELIGION_OPTIONS, 'Invalid selection.').required('Religion is required.'),
    other_religion: yup.string().when('religion', ([religionVal], schema) => {
        return religionVal === 'Other'
            ? schema.required('Please specify religion.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    community: yup.string().oneOf(COMMUNITY_OPTIONS, 'Invalid selection.').required('Community is required.'),
    other_community: yup.string().when('community', ([communityVal], schema) => {
        return communityVal === 'Other'
            ? schema.required('Please specify community.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),

    // Languages
    mother_tongue: yup.string().oneOf(LANGUAGE_OPTIONS, 'Invalid selection.').required("Mother Tongue is required."),
    other_mother_tongue: yup.string().when('mother_tongue', ([mtVal], schema) => {
        return mtVal === 'Other'
            ? schema.required('Please specify the mother tongue.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    student_languages: yup.array().of(individualLanguageSchemaYup)
        .min(1, "Please add at least one language known."),

    // Sibling Information
    has_sibling_in_ihs: yup.string().oneOf(YES_NO_OPTIONS, 'Invalid selection.').required('Please specify if applicant has sibling(s) in IHS.'),
    student_siblings: yup.array().of(individualSiblingSchemaYup).when('has_sibling_in_ihs', ([hasSibling], schema) => {
        return hasSibling === 'Yes'
            ? schema.min(1, "Please provide details for at least one sibling.")
            : schema.optional().transform(() => []); // Clear array if not applicable
    }),
    // Supporting Documents
    recent_photo: yupFileSchema(true, "Recent Photograph is required."),
    birth_certificate: yupFileSchema(true, "Birth Certificate is required."),
    id_proof_type: yup.string().oneOf(ID_PROOF_OPTIONS, 'Invalid selection.').required('ID Proof type is required.'),
    id_proof_document: yupFileSchema(true, "ID Proof Document is required."),
    aadhaar_number: yup.string().when('id_proof_type', ([idProofVal], schema) => {
        return idProofVal === 'Aadhaar Card'
            ? schema.required('Aadhaar Number is required.').matches(/^\d{12}$/, "Aadhaar Number must be exactly 12 digits.")
            : schema.optional().nullable().transform(() => undefined);
    }),
    passport_number: yup.string().when('id_proof_type', ([idProofVal], schema) => {
        return idProofVal === 'Passport'
            ? schema.required('Passport Number is required.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    passport_place_of_issue: yup.string().when('id_proof_type', ([idProofVal], schema) => {
        return idProofVal === 'Passport'
            ? schema.required('Place of Issue is required.').min(1)
            : schema.optional().nullable().transform(() => undefined);
    }),
    passport_date_of_issue: yup.date()
        .transform((value, originalValue) => originalValue === "" ? null : (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value))
        .nullable()
        .typeError('Invalid date format for issue date (YYYY-MM-DD).')
        .when('id_proof_type', ([idProofVal], schema) => {
            return idProofVal === 'Passport'
                ? schema.required('Date of Issue is required.').max(new Date(), "Passport issue date cannot be in the future.")
                : schema.optional().nullable().transform(() => undefined) as yup.DateSchema; // Cast needed due to .when complexity
        }),
    passport_date_of_expiry: yup.date()
        .transform((value, originalValue) => originalValue === "" ? null : (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value))
        .nullable()
        .typeError('Invalid date format for expiry date (YYYY-MM-DD).')
        .when('id_proof_type', ([idProofVal], schema) => {
            return idProofVal === 'Passport'
                ? schema.required('Date of Expiry is required.')
                    .test(
                        'is-after-issue-date-yup',
                        'Passport expiry date must be after the issue date.',
                        function (value) { // Expiry date
                            const issueDate = this.parent.passport_date_of_issue;
                            if (value instanceof Date && issueDate instanceof Date) {
                                return value > issueDate;
                            }
                            return true; // Let other validations catch if issueDate is not a Date
                        }
                    )
                : schema.optional().nullable().transform(() => undefined) as yup.DateSchema;
        }),
    // --- Academics Tab ---
    is_home_schooled: yup.string().oneOf(YES_NO_OPTIONS).required('Please specify if applicant is home schooled.'),
    current_school_name: yup.string().when('is_home_schooled', { is: 'No', then: _ => _.required("School Name is required."), otherwise: _ => _.optional().nullable().transform(() => undefined) }),
    current_school_board_affiliation: yup.string().when('is_home_schooled', { is: 'No', then: s => s.oneOf(BOARD_OPTIONS).required("Board Affiliation is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_other_board_affiliation: yup.string() // New field
        .when(['is_home_schooled', 'current_school_board_affiliation'], {
            is: (isHomeSchooled: string, boardAffiliation: string) =>
                isHomeSchooled === 'No' && boardAffiliation === 'Other',
            then: schema => schema.required('Please specify the board affiliation.').min(1),
            otherwise: schema => schema.optional().nullable().transform(() => undefined),
        }),
    current_school_emis: yup.string().when('is_home_schooled', { is: 'No', then: _ => _.optional(), otherwise: _ => _.optional().nullable().transform(() => undefined) }),
    current_school_phone_number: yupE164Phone().when('is_home_schooled', { is: 'No', then: () => yupE164Phone(true, "School Phone is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_country: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School Country is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_zipcode: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School Area Code is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_city: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School City is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_state: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School State is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_email_address: yup.string().email("Invalid email.").when('is_home_schooled', { is: 'No', then: s => s.required("School Email is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_address_line_1: yup.string().when('is_home_schooled', { is: 'No', then: s => s.required("School Address Line 1 is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    current_school_address_line_2: yup.string().optional().nullable(),

    been_to_school_previously: yup.string().oneOf(YES_NO_OPTIONS).required('Please specify if applicant studied previously.'),
    previous_schools: yup.array().of(individualPreviousSchoolSchemaYup).when('been_to_school_previously', {
        is: 'Yes', then: schema => schema.min(1, "Please provide details for at least one previous school."),
        otherwise: schema => schema.optional().transform(() => [])
    }),
    academic_strengths_and_weaknesses: yup.string().required().max(200), // Assuming textareaSchema implies required
    hobbies_interests_and_extra_curricular: yup.string().required().max(200),
    other_details_of_importance: yup.string().optional().nullable().max(200),
    temperament_and_personality: yup.string().required().max(200),
    learning_disability: yup.string().required().max(200),

    // --- Health Tab ---
    // Vaccines
    done_smallpox_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Smallpox vaccine status required.'),
    done_hepatitis_a_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Hepatitis A status required.'),
    done_hepatitis_b_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Hepatitis B status required.'),
    done_tdap_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Tdap status required.'),
    done_typhoid_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Typhoid status required.'),
    done_measles_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Measles status required.'),
    done_polio_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Polio status required.'),
    done_mumps_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Mumps status required.'),
    done_rubella_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Rubella status required.'),
    done_varicella_vaccine: yup.string().oneOf(YES_NO_OPTIONS).required('Varicella status required.'),
    other_vaccines: yup.string().optional().nullable(),
    vaccine_certificates: yupFileSchema(true, "Vaccine Certificate(s) are required."), // Assuming this is mandatory overall

    // Additional Health
    blood_group: yup.string().oneOf(BLOOD_GROUP_OPTIONS).required('Blood Group is required.'),
    wears_glasses_or_lens: yup.string().oneOf(YES_NO_OPTIONS).required('Please specify if applicant wears glasses/lenses.'),
    right_eye_power: yup.string().when('wears_glasses_or_lens', { is: 'Yes', then: s => s.required("Right Eye Power is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    left_eye_power: yup.string().when('wears_glasses_or_lens', { is: 'Yes', then: s => s.required("Left Eye Power is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // Hygiene for Class 2 (application_for is the discriminator)
    toilet_trained: yup.string().when('application_for', { is: 'Class 2', then: s => s.oneOf(YES_NO_OPTIONS).required('Toilet trained status is required for Class 2.'), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    bed_wet: yup.string().when('application_for', { is: 'Class 2', then: s => s.oneOf(YES_NO_OPTIONS).required('Bed wetting status is required for Class 2.'), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // Challenges
    has_hearing_challenges: yup.string().oneOf(YES_NO_OPTIONS).required('Hearing challenges status required.'),
    hearing_challenges: yup.string().when('has_hearing_challenges', { is: 'Yes', then: s => s.required("Hearing Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_behavioural_challenges: yup.string().oneOf(YES_NO_OPTIONS).required('Behavioural challenges status required.'),
    behavioural_challenges: yup.string().when('has_behavioural_challenges', { is: 'Yes', then: s => s.required("Behavioural Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_physical_challenges: yup.string().oneOf(YES_NO_OPTIONS).required('Physical challenges status required.'),
    physical_challenges: yup.string().when('has_physical_challenges', { is: 'Yes', then: s => s.required("Physical Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_speech_challenges: yup.string().oneOf(YES_NO_OPTIONS).required('Speech challenges status required.'),
    speech_challenges: yup.string().when('has_speech_challenges', { is: 'Yes', then: s => s.required("Speech Challenges Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    // Medical History
    history_of_accident_injury: yup.string().oneOf(YES_NO_OPTIONS).required('Injury history status required.'),
    history_of_accident_injury_details: yup.string().when('history_of_accident_injury', { is: 'Yes', then: s => s.required("Injury Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    regular_medication: yup.string().oneOf(YES_NO_OPTIONS).required('Medication status required.'),
    regular_medication_details: yup.string().when('regular_medication', { is: 'Yes', then: s => s.required("Medication Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    medical_prescription: yupFileSchema().when('regular_medication', { is: 'Yes', then: () => yupFileSchema(true, "Medical Prescription is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    history_of_health_issues: yup.string().oneOf(YES_NO_OPTIONS).required('Health issue history status required.'),
    history_of_health_issues_details: yup.string().when('history_of_health_issues', { is: 'Yes', then: s => s.required("Health Issue Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    surgery_hospitalization: yup.string().oneOf(YES_NO_OPTIONS).required('Hospitalization history status required.'),
    surgery_hospitalization_details: yup.string().when('surgery_hospitalization', { is: 'Yes', then: s => s.required("Hospitalization Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    special_attention: yup.string().oneOf(YES_NO_OPTIONS).required('Special attention status required.'), // Assuming this is from createEnumSchema
    special_attention_details: yup.string().when('special_attention', { is: 'Yes', then: s => s.required("Attention Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    has_allergies: yup.string().oneOf(YES_NO_OPTIONS).required('Allergies status required.'),
    allergies_details: yup.string().when('has_allergies', { is: 'Yes', then: s => s.required("Allergy Details are required.").min(1), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    // --- Parents Tab ---
    student_parent: yup.array().of(individualParentDetailSchemaYup)
        .min(1, "At least one parent's details are required.")
        .max(2, "A maximum of two parent entries are allowed.")
        .test('unique-parent-relations', 'Parent relations must be unique (e.g., one Father, one Mother).', function (value) {
            if (value && value.length === 2) {
                return value[0]?.relation !== value[1]?.relation;
            }
            return true;
        }),
    marital_status: yup.string().oneOf(PARENT_MARITAL_STATUS_OPTIONS).required('Parent Marital Status is required.'),
    primary_point_of_contact: yup.string().oneOf(PARENT_RELATION_OPTIONS).required('Primary Point of Contact is required.'),
    secondary_point_of_contact: yup.string().oneOf(PARENT_RELATION_OPTIONS).optional().nullable(),
    who_is_responsible_for_fee_payment: yup.string().when('marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS).required("Tuition payer is required for divorced status."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    court_order_document: yupFileSchema().when('marital_status', { is: 'Divorced', then: () => yupFileSchema(true, "Court Order Document is required for divorced status."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    who_is_allowed_to_receive_communication: yup.string().when('marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS).required("Communication receiver is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }), // Assuming options similar to FATHER_MOTHER_BOTH_OPTIONS
    legal_rights_document: yupFileSchema().when('marital_status', { is: 'Divorced', then: () => yupFileSchema(true, "Legal Rights Document is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    who_is_allowed_to_receive_report_cards: yup.string().when('marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS).required("Report card receiver is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),
    who_is_allowed_to_visit_school: yup.string().when('marital_status', { is: 'Divorced', then: s => s.oneOf(FATHER_MOTHER_BOTH_OPTIONS).required("Visit rights information is required."), otherwise: s => s.optional().nullable().transform(() => undefined) }),

    parents_are_local_guardians: yup.string().oneOf(YES_NO_OPTIONS).required("Please specify if parents are the local guardians."),
    student_guardians: yup.array().of(individualGuardianDetailSchemaYup).when('parents_are_local_guardians', {
        is: 'No', then: schema => schema.min(1, "Please provide local guardian details if parents are not local guardians."),
        otherwise: schema => schema.optional().transform(() => [])
    }),

    // --- Subjects Tab (Class 11) ---
    group_a: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.oneOf(PHYSICS_ACCOUNTS_HISTORY_OPTIONS).required("Group A subject is required."), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    group_b: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.oneOf(CHEMISTRY_ECONOMICS_OPTIONS).required("Group B subject is required."), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    group_c: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.oneOf(BIOLOGY_CS_COMMERCE_POLSCI_OPTIONS).required("Group C subject is required."), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    group_d: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.oneOf(MATH_ENV_FINEARTS_OPTIONS).required("Group D subject is required."), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),

    // Class 11 Questions
    response_why_ihs_post_10th: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    response_subject_combination: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    response_activity_love_to_do_most: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    response_change_one_thing_about_world: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    response_change_one_thing_about_yourself: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    response_dream_vacation: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    response_additional_comments_optional: yup.string().optional().nullable().max(200), // This one was marked optional

    parents_response_why_ihs_post_10th: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    parents_response_childs_self_confidence: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    parents_response_strengths_weaknesses: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    parents_response_child_future_education_plan: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    parents_response_on_childs_concerns: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),
    parents_response_additional_comments: yup.string().when('application_for', { is: 'Class 11', then: (s: yup.StringSchema) => s.required("This response is required.").max(200), otherwise: (s: yup.StringSchema) => s.optional().nullable().transform(() => undefined) }),

    // --- Declaration Tab ---
    agree_declaration: yup.boolean().oneOf([true], 'Please agree to the declaration.').required(),
    declaration_date: yup.date()
        .transform((value: unknown, originalValue: unknown) =>
            originalValue === "" ? null :
                (originalValue && typeof originalValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(originalValue) ? new Date(originalValue) : value)
        )
        .nullable()
        .typeError('Invalid date format (YYYY-MM-DD).')
        .required('Date is required.'),
    declaration_place: yup.string().required('Place is required.'),

    // --- Billing Tab ---
    billing_first_name: yup.string().required('Billing First Name is required.'),
    billing_last_name: yup.string().required('Billing Last Name is required.'),
    billing_mobile: yupE164Phone(true),
    billing_email: yup.string().email('Invalid Billing Email format.').required("Billing Email is required."),
    billing_country: yup.string().required('Billing Country is required.'),
    billing_zipcode: yup.string().required('Billing Area Code/ Pincode is required.'),
    billing_city: yup.string().required('Billing City/ Town is required.'),
    billing_state: yup.string().required('Billing State is required.'), // Assuming state is required for billing
    billing_address_line_1: yup.string().required('Billing Address Line 1 is required.'),
    billing_address_line_2: yup.string().optional().nullable(),

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