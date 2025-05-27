import { UseFormSetValue } from "react-hook-form";
import { AdmissionRegistrationFormDataYup } from "./yupSchema";
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as yup from 'yup';
import type { Path } from 'react-hook-form';

export const yupE164Phone = (required = false, requiredMsg = "Phone number is required.") => {
    let schema = yup.string().test(
        'is-e164-phone',
        'Invalid phone number format. Please include country code.',
        (value) => {
            if (!value || value.trim() === '') return true; // Allow empty for optional fields
            return isValidPhoneNumber(value); // Your existing phone validation logic
        }
    );
    if (required) {
        schema = schema.required(requiredMsg);
    }
    return schema;
};

export const calculateAge = (dobString: string | undefined): number | null => {
    if (!dobString) return null;
    try {
        const birthDate = new Date(dobString);
        // Check if the date is valid - Date.parse would return NaN for invalid dates,
        // and new Date(invalid_string) can sometimes result in "Invalid Date" object.
        if (isNaN(birthDate.getTime())) {
            return null;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 0 ? 0 : age; // Don't allow negative age
    } catch (e) {
        console.error("Error calculating age:", e);
        return null;
    }
};
// Example: Yup Helper for File (Basic)
export const MAX_FILE_SIZE_MB_YUP = 5;
export const MAX_FILE_SIZE_BYTES_YUP = MAX_FILE_SIZE_MB_YUP * 1024 * 1024;
export const ACCEPTABLE_FILE_TYPES_YUP = ["application/pdf", "image/jpeg", "image/png"];

// Helper to get last N academic years as strings (can be reused)
export function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const nextYear = (year + 1).toString().slice(-2);
    return `${year}-${nextYear}`;
}

export const getLastNAcademicYears = (n: number): string[] => {
    const years: string[] = [];
    const now = new Date();
    const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    for (let i = 0; i < n; i++) {
        const currentAcademicYearStart = year - i;
        const nextYearSlice = (currentAcademicYearStart + 1).toString().slice(-2);
        years.push(`${currentAcademicYearStart}-${nextYearSlice}`);
    }
    return years.reverse();
};

export const currentYear = new Date().getFullYear();

// --- Define Yup constants for dropdown options ---
// (You'll need to extract all these from your Zod schema or form)
export const GENDER_OPTIONS_YUP = ['Male', 'Female', 'Other'] as const;
export const YES_NO_OPTIONS_YUP = ['Yes', 'No'] as const;
export const APPLIED_FOR_OPTIONS_YUP = ['Class II', 'Class V', 'Class VIII', 'Class XI'] as const;
export const PREVIOUS_APP_YEAR_OPTIONS_YUP_RAW = getLastNAcademicYears(5).filter(year => {
    const startYear = parseInt(year.split('-')[0], 10);
    return startYear >= 2020;
});
// Yup's .oneOf expects a non-empty array. Provide a fallback if empty.
export const PREVIOUS_APP_YEAR_OPTIONS_YUP = PREVIOUS_APP_YEAR_OPTIONS_YUP_RAW.length > 0 ? PREVIOUS_APP_YEAR_OPTIONS_YUP_RAW : ['2019-20'];

export const RELIGION_OPTIONS_YUP = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jew', 'Other'] as const;
export const COMMUNITY_OPTIONS_YUP = ['OC', 'BC', 'BC-Others', 'MBC', 'SC-Arunthathiyar', 'SC-Others', 'DNC (Denotified Communities)', 'ST', 'Other'] as const;
export const ID_PROOF_OPTIONS_YUP = ['Aadhaar Card', 'Passport'] as const;
export const LANGUAGE_OPTIONS_YUP = ['English', 'Tamil', 'Hindi', 'French', 'German', 'Spanish', 'Arabic', 'Mandarin', 'Japanese', 'Other'] as const; // Example
export const LANGUAGE_PROFICIENCY_YUP = ['Native', 'Advanced', 'Intermediate', 'Basic'] as const;

export const BOARD_OPTIONS_YUP = [
    "CBSE – Central Board of Secondary Education", "ICSE - Indian Certificate of Secondary Education",
    "SSC - Secondary School Certificate", "IB - International Baccalaureate", "Cambridge International",
    "State Board", "Other"
] as const;
export const BLOOD_GROUP_OPTIONS_YUP = ['Blood Group A+', 'Blood Group A-', 'Blood Group B+', 'Blood Group B-', 'Blood Group O+', 'Blood Group O-', 'Blood Group AB+', 'Blood Group AB-'] as const;
export const PARENT_MARITAL_STATUS_OPTIONS_YUP = ['Married', 'Separated', 'Divorced', 'Single Parent'] as const;
export const FATHER_MOTHER_BOTH_OPTIONS_YUP = ['Father', 'Mother', 'Both'] as const;
export const CLASS_LEVEL_OPTIONS_YUP = ['LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'] as const;

// Generic function to fetch address detailsconst
export const fetchAddressDetails = async (
    countryISO2: string,
    zipcode: string,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    formFieldNameForState: string,
    formFieldNameForCity: string,
    setValueRHF: UseFormSetValue<AdmissionRegistrationFormDataYup>
) => {
    setLoading(true);
    setError(null);
    // No need to call setStates([]) or setCities([]) anymore

    const apiUrl = `https://cdi-gateway.isha.in/contactinfovalidation/api/countries/${countryISO2}/pincodes/${zipcode}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorMsg = `Pincode ${zipcode} not found for ${countryISO2} or API error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || `API Error ${response.status}: ${response.statusText}`;
            } catch {
                errorMsg = `API Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();

        // API gives a single state as data.state
        // API gives acceptedCities as an array
        if (data && data.state) { // Check for state at least
            const stateValue = data.state;
            setValueRHF(formFieldNameForState as any, stateValue, { shouldValidate: true });

            let cityToSet = ""; // Default to empty if no cities or default city
            if (data.acceptedCities && Array.isArray(data.acceptedCities)) {
                if (data.defaultcity && data.acceptedCities.includes(data.defaultcity)) {
                    cityToSet = data.defaultcity;
                }
            }
            setValueRHF(formFieldNameForCity as any, cityToSet, { shouldValidate: true });

        } else {
            // If data.state is not present, or structure is unexpected for state
            setError("State not found or invalid data structure from address API.");
            setValueRHF(formFieldNameForState as any, "", { shouldValidate: true });
            setValueRHF(formFieldNameForCity as any, "", { shouldValidate: true });
        }
    } catch (error: any) {
        console.error("Failed to fetch address details:", error);
        setError(error.message || "Failed to fetch details.");
        setValueRHF(formFieldNameForState as any, "", { shouldValidate: true });
        setValueRHF(formFieldNameForCity as any, "", { shouldValidate: true });
    } finally {
        setLoading(false);
    }
};

export type Country = {
    alpha2: string;
    alpha3: string;
    countryCallingCodes: string[];
    currencies: string[];
    emoji?: string;
    ioc: string;
    languages: string[];
    name: string;
    status: string;
};

export const LANGUAGE_OPTIONS = ['English', 'Tamil', 'Hindi', 'French', 'German', 'Spanish', 'Arabic', 'Mandarin', 'Japanese', 'Other'] as const;
export const PROFICIENCY_OPTIONS = ['Native', 'Advanced', 'Intermediate', 'Basic'] as const;
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;
export const YES_NO_OPTIONS = ['Yes', 'No'] as const; // For many of your "Select Yes/No" fields
export const APPLIED_FOR_OPTIONS = ['Class II', 'Class V', 'Class VIII', 'Class XI'] as const;
export const PREVIOUS_APP_YEAR_OPTIONS = getLastNAcademicYears(4) as [string, ...string[]]; // Assuming getLastNAcademicYears returns string[]

export const RELIGION_OPTIONS_ARRAY = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jew', 'Other'] as const;
export const COMMUNITY_OPTIONS_ARRAY = ['OC', 'BC', 'BC-Others', 'MBC', 'SC-Arunthathiyar', 'SC-Others', 'DNC (Denotified Communities)', 'ST', 'Other'] as const;
export const ID_PROOF_OPTIONS_ARRAY = ['Aadhaar Card', 'Passport'] as const;
export const BOARD_OPTIONS = [
    "CBSE – Central Board of Secondary Education", "ICSE - Indian Certificate of Secondary Education",
    "SSC - Secondary School Certificate", "IB - International Baccalaureate", "Cambridge International",
    "State Board", "Other"
] as const;
export const GUARDIAN_RELATION_OPTIONS_YUP = ["Grand Father", "Grand Mother", "Sibling", "Uncle", "Aunt", "Family Friend", "Other"] as const;
export const PARENT_RELATION_OPTIONS_YUP = ['Father', 'Mother'] as const;
export const PARENT_EDUCATION_LEVEL_OPTIONS_YUP = [
    "Class VIII or below",
    "SSLC/ PUC",
    "Higher Secondary",
    "Graduate",
    "Post-Graduate",
    "M. Phil",
    "PhD",
    "Post-Doctoral"
] as const;
export const PARENT_PROFESSION_OPTIONS_YUP = [
    "Academia-Professors, Research Scholars, Scientists",
    "Arts, Music, Entertainment",
    "Architecture and Construction",
    "Agriculture",
    "Armed Forces",
    "Banking and Finance and Financial Services",
    "Businessman/ Entrepreneur",
    "Education and Training",
    "Information Technology",
    "Healthcare",
    "Others"
] as const;

export const BLOOD_GROUP_OPTIONS_ARRAY = ['Blood Group A+', 'Blood Group A-', 'Blood Group B+', 'Blood Group B-', 'Blood Group O+', 'Blood Group O-', 'Blood Group AB+', 'Blood Group AB-'] as const;
export const PARENT_MARITAL_STATUS_OPTIONS_ARRAY = ['Married', 'Separated', 'Divorced', 'Single Parent'] as const;
export const FATHER_MOTHER_BOTH_OPTIONS = ['Father', 'Mother', 'Both'] as const;
export const PHYSICS_ACCOUNTS_HISTORY_OPTIONS = ['Physics', 'Accounts', 'History'] as const;
export const BIOLOGY_CS_COMMERCE_POLSCI_OPTIONS = ['Biology', 'Computer Science', 'Commerce', 'Political Science'] as const;
export const CHEMISTRY_ECONOMICS_OPTIONS = ['Chemistry', 'Economics'] as const;
export const MATH_ENV_FINEARTS_OPTIONS = ['Mathematics', 'Environmental Studies', 'Fine Arts'] as const;
export const PARENT_RELATION_OPTIONS = ['Father', 'Mother'] as const;
export const PARENT_EDUCATION_LEVEL_OPTIONS_STRING = "Class VIII or below\nSSLC/ PUC\nHigher Secondary\nGraduate\nPost-Graduate\nM. Phil\nPhD\nPost-Doctoral";
export const PARENT_PROFESSION_OPTIONS_STRING = "Academia-Professors, Research Scholars, Scientists\nArts, Music, Entertainment\nArchitecture and Construction\nAgriculture\nArmed Forces\nBanking and Finance and Financial Services\nBusinessman/ Entrepreneur\nEducation and Training\nInformation Technology\nHealthcare\nOthers";

export const TAB_FIELD_GROUPS: Record<string, Path<AdmissionRegistrationFormDataYup>[]> = {
    personal: [
        "application_academic_year", "application_for", /* "application_number", // Usually not validated by user */
        "applied_to_ihs_before", "previous_applied_year", "previous_applied_for", "previous_applied_comments",
        "first_name", "last_name", "middle_name", "gender",
        "nationality", "country_of_residence", "country_of_birth", "date_of_birth", "age",
        "country", "zipcode", "state", "city", "address_line_1", "address_line_2",
        "identification_mark_1", "identification_mark_2", "religion", "other_religion", "community", "other_community",
        "mother_tongue", "other_mother_tongue", "student_languages", // Note: array validation might need specific handling or be part of a sub-schema validation
        "has_sibling_in_ihs", "student_siblings",
        "recent_photo", "birth_certificate", "id_proof_type", "id_proof_document",
        "aadhaar_number", "passport_number", "passport_place_of_issue", "passport_date_of_issue", "passport_date_of_expiry"
    ],
    academic: [
        "is_home_schooled", "current_school_name", "current_school_board_affiliation", "current_school_other_board_affiliation",
        "current_school_phone_number",
        "current_school_email_address", "current_school_country", "current_school_zipcode", "current_school_city",
        "current_school_state", "current_school_address_line_1", "current_school_address_line_2",
        "been_to_school_previously", "previous_schools", // was_the_applicant_ever_home_schooled (if it's a distinct field)
        "academic_strengths_and_weaknesses", "hobbies_interests_and_extra_curricular",
        "temperament_and_personality", "learning_disability", "other_details_of_importance"
    ],
    health: [
        "done_smallpox_vaccine", "done_hepatitis_a_vaccine", "done_hepatitis_b_vaccine", "done_tdap_vaccine",
        "done_typhoid_vaccine", "done_measles_vaccine", "done_polio_vaccine", "done_mumps_vaccine",
        "done_rubella_vaccine", "done_varicella_vaccine", "other_vaccines", "vaccine_certificates",
        "blood_group", "wears_glasses_or_lens", "right_eye_power", "left_eye_power",
        "toilet_trained", "bed_wet",
        "has_hearing_challenges", "hearing_challenges", "has_behavioural_challenges", "behavioural_challenges",
        "has_physical_challenges", "physical_challenges", "has_speech_challenges", "speech_challenges",
        "history_of_accident_injury", "history_of_accident_injury_details", "regular_medication", "regular_medication_details", "medical_prescription",
        "history_of_health_issues", "history_of_health_issues_details", "surgery_hospitalization", "surgery_hospitalization_details",
        "special_attention", "special_attention_details", "has_allergies", "allergies_details"
    ],
    parents: [
        "student_parent", // Validating the array itself (e.g., min length) and its items
        "marital_status", "primary_point_of_contact",
        "who_is_responsible_for_fee_payment", "court_order_document",
        "who_is_allowed_to_receive_communication", "legal_rights_document",
        "who_is_allowed_to_receive_report_cards", "who_is_allowed_to_visit_school",
        "parents_are_local_guardians", "student_guardians"
    ],
    subjects: [ // Only if application_for is Class XI
        "group_a", "group_b", "group_c", "group_d",
        "response_why_ihs_post_10th", "response_subject_combination", "response_activity_love_to_do_most", "response_change_one_thing_about_world",
        "response_change_one_thing_about_yourself", "response_dream_vacation", "response_additional_comments_optional",
        "parents_response_why_ihs_post_10th", "parents_response_childs_self_confidence", "parents_response_strengths_weaknesses", "parents_response_child_future_education_plan",
        "parents_response_on_childs_concerns", "parents_response_additional_comments"
    ],
    declaration: [
        "agree_declaration", "declaration_date", "declaration_place"
    ],
    billing: [ // Payment tab might not need pre-validation if it's just info + submit
        "billing_first_name", "billing_last_name", "billing_mobile", "billing_email", "billing_country",
        "billing_zipcode", "billing_city", "billing_state", "billing_address_line_1", "billing_address_line_2"
    ]
    // "instruction" tab has no fields to validate
};

// Ensure TAB_KEYS matches the keys in TAB_FIELD_GROUPS (excluding 'instruction')
export const TAB_ORDER: string[] = [
    "instruction", "personal", "academic", "health", "parents", "subjects", "declaration", "billing"

];
export const get = (
    obj: Record<string, unknown>,
    path: string,
    defaultValue?: unknown
): unknown => {
    const keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
    let result: unknown = obj;
    for (const key of keys) {
        if (result === null || typeof result !== 'object' || !(key in result)) {
            return defaultValue;
        }
        result = (result as Record<string, unknown>)[key];
    }
    return result;
};