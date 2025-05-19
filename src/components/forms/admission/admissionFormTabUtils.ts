import { UseFormSetValue } from "react-hook-form";
import { AdmissionRegistrationFormDataYup } from "./yupSchema";
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as yup from 'yup';

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
    countryISO2: string, // <-- Changed from countryName
    zipcode: string,
    setStates: (states: string[]) => void,
    setCities: (cities: string[]) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    formFieldNameForState: keyof AdmissionRegistrationFormDataYup | string, // Allow string for dynamic paths like 'students_parents.0.parent_address_state'
    formFieldNameForCity: keyof AdmissionRegistrationFormDataYup | string,
    setValueRHF: UseFormSetValue<AdmissionRegistrationFormDataYup>  // <-- Add form parameter
) => {
    setLoading(true);
    setError(null);
    setStates([]); // Clear previous states
    setCities([]); // Clear previous cities

    const apiUrl = `https://cdi-gateway.isha.in/contactinfovalidation/api/countries/${countryISO2}/pincodes/${zipcode}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorMsg = `Pincode ${zipcode} not found for ${countryISO2} or API error: ${response.status}`;
            try {
                const errorData = await response.json();
                // Use a more specific error message if the API provides one
                errorMsg = errorData.message || errorData.error || `API Error ${response.status}: ${response.statusText}`;
            } catch {
                // If error response is not JSON, use the status text
                errorMsg = `API Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data && data.state && data.acceptedCities && Array.isArray(data.acceptedCities)) {
            const stateArray = [data.state]; // API gives a single state
            const citiesArray = data.acceptedCities;

            setStates(stateArray);
            setCities(citiesArray);

            if (stateArray.length > 0) {
                setValueRHF(formFieldNameForState as any, stateArray[0], { shouldValidate: true });
            } else {
                setValueRHF(formFieldNameForState as any, "", { shouldValidate: true });
            }

            if (citiesArray.length > 0) {
                const cityToSet = data.defaultcity && citiesArray.includes(data.defaultcity)
                    ? data.defaultcity
                    : citiesArray[0];
                setValueRHF(formFieldNameForCity as any, cityToSet, { shouldValidate: true });
            } else {
                setValueRHF(formFieldNameForCity as keyof AdmissionRegistrationFormDataYup | string, "", { shouldValidate: true });
            }

            // This specific error might be redundant if API returns 404 for no data.
            // if (stateArray.length === 0 && citiesArray.length === 0) {
            //     setError("State and City not found for this pincode and country.");
            // }
        } else {
            setError("Invalid data structure received from address API.");
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
