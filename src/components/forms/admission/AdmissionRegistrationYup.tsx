//src/components/forms/admission/AdmissionRegistrationForm.tsx
import { yupResolver } from '@hookform/resolvers/yup'; // <--- CHANGED
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
// Make sure this path points to your new Yup schema file
import {
    admissionRegistrationSchemaYup, // <--- CHANGED
    type AdmissionRegistrationFormDataYup, // <--- CHANGED (ensure this type is exported from your Yup schema file)
    // You'll need to export Yup-inferred types for these from your Yup schema file as well:
    type IndividualParentDetailDataYup,    // <--- CHANGED (Example name)
    type IndividualSiblingDataYup,       // <--- CHANGED (Example name)
    type IndividualGuardianDetailDataYup,  // <--- CHANGED (Example name)
    type IndividualPreviousSchoolDataYup,
    // type IndividualLanguageDataYup (if you have one)
} from './yupSchema'; // Adjust the path as necessary

import { BOARD_OPTIONS_YUP, calculateAge, fetchAddressDetails, getCurrentAcademicYear, getLastNAcademicYears, LANGUAGE_OPTIONS, PARENT_RELATION_OPTIONS_YUP } from './admissionFormTabUtils';
import { LanguagesKnownSection } from './LanguagesKnownSection'; // Adjust path if needed
import { StudentSiblingsSection } from './StudentSiblingsSection'; // <-- NEW IMPORT
import { PreviousSchoolsSection } from './PreviousSchoolsSection';
import { StudentGuardianDetailSection } from './StudentGuardianDetailSection';
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
import { useState, useEffect } from "react"; // Added useEffect
import AdmissionProcedure from './AdmissionProcedure';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"; // Import Shadcn Dialog components
import { Eye } from "lucide-react";
import { CountryDropdown } from "@/components/ui/country-dropdown"; // Import the CountryDropdown component
import { countries } from "country-data-list";
import { PhoneInput } from "@/components/ui/phone-input"; // <-- Add this import
import { StudentParentDetailSection } from './StudentParentDetailSection';

// Add Country type for type safety
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

// --- Helper Function to parse Frappe Select options ---
const parseSelectOptions = (optionsString: string | null | undefined): string[] => {
    if (!optionsString) return [];
    return optionsString.split('\n').map(o => o.trim()).filter(o => o.length > 0);
};

// Helper to get current academic year string (e.g., "2024-25")


// Helper to get last N academic years as strings (e.g., "2023-24")



const appliedForOptions = ['Class II', 'Class V', 'Class VIII', 'Class XI'];


export function AdmissionRegistrationForm() {
    const [commStateOptions, setCommStateOptions] = useState<string[]>([]);
    const [commCityOptions, setCommCityOptions] = useState<string[]>([]);
    const [isCommAddressLoading, setIsCommAddressLoading] = useState(false);
    const [commAddressError, setCommAddressError] = useState<string | null>(null);
    const [billStateOptions, setBillStateOptions] = useState<string[]>([]);
    const [billCityOptions, setBillCityOptions] = useState<string[]>([]); // <-- Updated variable name
    const [isBillAddressLoading, setIsBillAddressLoading] = useState(false);
    const [billAddressError, setBillAddressError] = useState<string | null>(null); // <-- Updated variable name
    // --- NEW: For Current School Address ---
    const [currentSchoolStateOptions, setCurrentSchoolStateOptions] = useState<string[]>([]);
    const [currentSchoolCityOptions, setCurrentSchoolCityOptions] = useState<string[]>([]);
    const [isCurrentSchoolAddressLoading, setIsCurrentSchoolAddressLoading] = useState(false);
    const [currentSchoolAddressError, setCurrentSchoolAddressError] = useState<string | null>(null);
    // 1. Define form with updated default values
    const form = useForm<AdmissionRegistrationFormDataYup>({
        // @ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
        resolver: yupResolver(admissionRegistrationSchemaYup),
        // Updated default values reflecting the flattened schema for parents/siblings
        defaultValues: {
            application_year: getCurrentAcademicYear(),
            // applied_for: 'Class V', // Default from appliedForOptions
            // applicant_user: 'applicant@example.com', // Example
            // applied_to_ihs_before: 'No',
            // previous_application_application_year: previousApplicationYears[0] || '', // Default to most recent or empty
            // previous_application_applied_for: 'Class II', // Default from appliedForOptions
            // previous_application_remarks: '',
            // first_name: 'ApplicantFirstName',
            // middle_name: '',
            // last_name: 'ApplicantLastName',
            gender: undefined, // Or '' or one of GENDER_OPTIONS
            // nationality: 'India',
            // country_of_residence: 'India',
            // country: 'India', // Country of Birth
            // date_of_birth: '2010-01-01', // Example past date
            // age: 14, // Example, or calculate based on DOB
            // comm_address_country: 'India',
            // comm_address_area_code: '110001',
            // comm_address_line_1: '123 Applicant Comm St',
            // comm_address_line_2: 'Apt 1',
            // comm_address_city: 'New Delhi',
            // comm_address_state: 'Delhi',
            // religion: 'Hindu', // Default from RELIGION_OPTIONS
            // community: 'OC',   // Default from COMMUNITY_OPTIONS
            // identification_mark_2: 'Scar on forehead',
            // other_religion: '',
            // other_community: '',
            // mother_tongue: 'English', // Example
            languages_known: [
                { language: undefined, proficiency: undefined },
            ],
            // has_sibling_in_ihs: 'Yes',
            student_siblings: [], // Will be auto-populated by useEffect if has_sibling_in_ihs is 'Yes' initially
            // recent_photograph: undefined,
            // birth_certificate: undefined,
            // id_proof: 'Aadhaar Card', // Default from ID_PROOF_OPTIONS
            // id_proof_document: undefined,
            // aadhaar_number: '', // Example: '123456789012' - conditionally required
            // passport_number: '',
            // place_of_issue: '',
            // date_of_issue: '',
            // date_of_expiry: '',
            // is_home_schooled: 'No',
            // current_school_name: 'Current Public School',
            // current_school_board_affiliation: 'CBSE', // Default from BOARD_AFFILIATION_OPTIONS
            // current_school_phone_number: '+919988776655', // E.164 format
            // current_school_country: 'India',
            // current_school_area_code: '110002',
            // current_school_city: 'New Delhi',
            // current_school_state: 'Delhi',
            // current_school_email_address: 'currentschool@example.com',
            // current_school_a_line1: '456 School Rd',
            // current_school_a_line2: '',
            // was_the_applicant_ever_home_schooled: 'No',
            // been_to_school_previously: 'No', // Set to No so previous_schools_table is initially empty
            previous_schools: [],
            emis_id: '',
            // academic_strengths_and_weaknesses: 'Strong in sciences.',
            // hobbies_interests_and_extra_curricular_activities: 'Reading, Chess.',
            // other_details_of_importance: '',
            // temperament_and_personality: 'Inquisitive and calm.',
            // special_learning_needs_or_learning_disability: 'None reported.',
            // done_smallpox_vaccine: 'Yes',
            // done_hepatitis_a_vaccine: 'Yes',
            // done_hepatitis_b_vaccine: 'Yes',
            // done_tdap_vaccine: 'Yes',
            // done_typhoid_vaccine: 'Yes',
            // done_measles_vaccine: 'Yes',
            // done_polio_vaccine: 'Yes',
            // done_mumps_vaccine: 'Yes',
            // done_rubella_vaccine: 'Yes',
            // done_varicella_vaccine: 'Yes',
            // other_vaccines: '',
            // vaccine_certificates: undefined,
            // blood_group: 'Blood Group A+', // Default from BLOOD_GROUP_OPTIONS
            // wears_glasses_or_lens: 'No',
            // right_eye_power: '',
            // left_eye_power: '',
            // is_toilet_trained: 'Yes', // Relevant if applied_for is Class II
            // wets_bed: 'No',           // Relevant if applied_for is Class II
            // bed_wet_frequency: '',    // Relevant if wets_bed is Yes
            // has_hearing_challenges: 'No',
            // hearing_challenges: '',
            // has_behavioural_challenges: 'No',
            // behavioural_challenges: '',
            // has_physical_challenges: 'No',
            // physical_challenges: '',
            // has_speech_challenges: 'No',
            // speech_challenges: '',
            // has_injury: 'No',
            // injury_details: '',
            // on_medication: 'No',
            // medication_details: '',
            // medical_prescription: undefined,
            // has_health_issue: 'No',
            // health_issue_details: '',
            // was_hospitalized: 'No',
            // hospitalization_details: '',
            // needs_special_attention: 'No',
            // attention_details: '',
            // has_allergies: 'No',
            // allergy_details: '',
            students_parents: [
                {
                    // parent_first_name: 'Parent1 First',
                    // parent_last_name: 'Parent1 Last',
                    // parent_relation: 'Father', // Default from PARENT_RELATION_OPTIONS
                    // parent_nationality: 'India',
                    // parent_country_of_residence: 'India',
                    // parent_contact_email: 'parent1@example.com',
                    // parent_contact_phone: '+919123456780', // E.164
                    // parent_is_whatsapp_same: true as boolean,
                    // parent_whatsapp_number: '',
                    // parent_is_address_same_as_applicant: 'Yes',
                    // parent_address_country: '', // Copied if 'Yes'
                    // parent_address_zipcode: '',
                    // parent_address_state: '',
                    // parent_address_city: '',
                    // parent_address_line1: '',
                    // parent_address_line2: '',
                    // parent_education: 'Graduate', // Default from PARENT_EDUCATION_LEVEL_OPTIONS
                    // parent_field_of_study: 'Business Administration',
                    // parent_profession: 'Businessman/ Entrepreneur', // Default from PARENT_PROFESSION_OPTIONS
                    // parent_organization_name: 'Parent1 Inc.',
                    // parent_designation: 'Director',
                    // parent_annual_income: '2500000',
                }
                // You can add a second default parent object here if needed
                // ,{
                //   parent_first_name: 'Parent2 First',
                //   parent_last_name: 'Parent2 Last',
                //   parent_relation: 'Mother',
                //   ... (similarly fill all fields)
                // }
            ],
            // parent_marital_status: 'Married', // Default from PARENT_MARITAL_STATUS_OPTIONS
            // who_is_responsible_for_paying_applicants_tuition_fee: 'Both', // Default from options
            // court_order_document: undefined,
            // who_is_allowed_to_receive_school_communication: 'Both',
            // legal_rights_document: undefined,
            // who_is_allowed_to_receive_report_cards: 'Both',
            // visit_rights: 'Both',
            // parents_are_local_guardians: 'Yes', // Default to Yes, so guardian section is initially hidden
            student_guardians: [],            // Will be auto-populated by useEffect if parents_are_local_guardians is 'No'
            // group_a: undefined, // For Class XI
            // group_b: undefined,
            // group_c: undefined,
            // group_d: undefined,
            // q1_applicant_response: '', q2_applicant_response: '', q3_applicant_response: '', q4_applicant_response: '',
            // q5_applicant_response: '', q6_applicant_response: '', q7_applicant_response: '',
            // q1_parent_response: '', q2_parent_response: '', q3_parent_response: '', q4_parent_response: '',
            // q5_parent_response: '', q6_parent_response: '',
            // declaration: false, // Should typically default to false
            // date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
            // place: 'Default City',
            // billing_name: 'Billing Name',
            // billing_phone: '+919000000000', // E.164
            // billing_email: 'billing@example.com',
            // billing_country: 'India',
            // billing_area_code: '110001',
            // billing_city: 'New Delhi',
            // billing_state: 'Delhi',
            // billing_address_l1: '789 Billing St',
            // billing_address_l2: '',
            // application_fee_status: 'Pending', // Default from options
            // program: 'General', // Example
            // payment_program_links: [],
            // amended_from: '',
            // application_feedback_status: undefined, // Default from options or undefined
            // application_feedback: '',
            // orientation_feedback_status: undefined,
            // academics_feedback: '',
            // group_activities_feedback: '',
            // sports_feedback: '',
            // dining: '',
            // other_feedback: '',
            // interview_feedback_status: undefined,
            // interview_feedback: '',
        },
        mode: 'onBlur', // Validate on blur
    });
    // 2. Watch fields (Keep existing watches, they are still relevant for conditional logic)
    const watchAppliedBefore = form.watch("applied_to_ihs_before");
    const watchMotherTongue = form.watch("mother_tongue");
    const watchReligion = form.watch("religion");
    const watchCommunity = form.watch("community");
    const watchAppliedFor = form.watch("applied_for");
    const watchHasSibling = form.watch("has_sibling_in_ihs"); // Used for sibling section visibility
    const watchIdProof = form.watch("id_proof");
    const watchIsHomeSchooled = form.watch("is_home_schooled");
    const watchStudiedPreviously = form.watch("been_to_school_previously");
    const watchedDateOfBirth = form.watch("date_of_birth");

    //To auto Fill the State and City based on the country selected
    const watchCommCountry = form.watch("comm_address_country");
    const watchCommZipcode = form.watch("comm_address_area_code");

    const watchBillingCountry = form.watch("billing_country");
    const watchBillingZipcode = form.watch("billing_area_code");

    // Watch fields for Current School Address
    const watchCurrentSchoolCountry = form.watch("current_school_country"); // Make sure this field exists in schema/form
    const watchCurrentSchoolZipcode = form.watch("current_school_area_code");

    // const watchCurrentSchoolState = form.watch("current_school_state");
    const watchWearsGlasses = form.watch("wears_glasses_or_lens");
    const watchHearing = form.watch("has_hearing_challenges");
    const watchWetsBed = form.watch("wets_bed");
    const watchBehavioural = form.watch("has_behavioural_challenges");
    const watchPhysical = form.watch("has_physical_challenges");
    const watchSpeech = form.watch("has_speech_challenges");
    const watchInjury = form.watch("has_injury");
    const watchMedication = form.watch("on_medication");
    const watchHealthIssue = form.watch("has_health_issue");
    const watchHospitalized = form.watch("was_hospitalized");
    const watchSpecialAttention = form.watch("needs_special_attention");
    const watchAllergies = form.watch("has_allergies"); // Fixed typo
    const watchMaritalStatus = form.watch("parent_marital_status");
    const watchParentsAreLocalGuardians = form.watch("parents_are_local_guardians");
    // Used for divorce section
    // const watchParentsAreGuardians = form.watch("parents_are_local_guardians"); // Used for guardian section
    // const watchWhoPaysTuition = form.watch("who_is_responsible_for_paying_applicants_tuition_fee"); // Fixed typo

    const { control, getValues, setValue, watch, trigger, getFieldState } = form;

    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
        control: form.control,
        name: "languages_known"
    });
    const { fields: siblingFields, append: appendSibling, remove: removeSibling } = useFieldArray({
        control: form.control,
        name: "student_siblings"
    });
    const { fields: schoolFields, append: appendSchool, remove: removeSchool } = useFieldArray({
        control: form.control,
        name: "previous_schools"
    });

    const { fields: parentFields, append: appendParent, remove: removeParent } = useFieldArray({
        control, // same as form.control
        name: "students_parents"
    });

    const { fields: guardianDetailFields, append: appendGuardianDetail, remove: removeGuardianDetail } = useFieldArray({
        control,
        name: "student_guardians"
    });
    // --- Modal State and Handlers ---
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);

    const handlePreviewFile = (file: File | null | undefined) => {
        if (file && file instanceof File) {
            const url = URL.createObjectURL(file);
            setPreviewFile({ url, type: file.type, name: file.name });
            setIsPreviewModalOpen(true);
        }
    };

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            if (previewFile) {
                URL.revokeObjectURL(previewFile.url);
            }
            setPreviewFile(null);
        }
        setIsPreviewModalOpen(open);
    };

    // Cleanup object URL on component unmount or when previewFile.url changes
    useEffect(() => {
        return () => {
            if (previewFile?.url) {
                URL.revokeObjectURL(previewFile.url);
            }
        };
    }, [previewFile?.url]);

    useEffect(() => {
        const ageValue = calculateAge(
            watchedDateOfBirth instanceof Date
                ? watchedDateOfBirth.toISOString().split('T')[0]
                : watchedDateOfBirth
        );
        if (ageValue !== null) {
            // Check if the new age is different from the current age in the form to avoid unnecessary updates/re-renders
            const currentAgeInForm = getValues("age");
            if (currentAgeInForm !== ageValue) {
                setValue("age", ageValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            }
        } else {
            const currentAgeInForm = getValues("age");
            if (currentAgeInForm !== undefined && currentAgeInForm !== null) { // Check if there's a value to clear
                setValue("age", 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true }); // Set to 0 if DOB is invalid or cleared
            }
        }
        // Only run when watchedDateOfBirth changes.
        // Adding setValue and getValues to deps can cause infinite loops if not careful.
        // RHF's setValue is stable, getValues should ideally not be needed in deps if logic is right.
    }, [watchedDateOfBirth, setValue, getValues]);

    useEffect(() => {
        if (watchHasSibling === 'Yes' && siblingFields.length === 0) {
            appendSibling({
                sibling_first_name: '',
                sibling_last_name: '',
                sibling_roll_number: '',
                sibling_date_of_birth: '',
                sibling_gender: ''
                // Cast to IndividualSiblingData if TypeScript complains about partial type
            } as unknown as IndividualSiblingDataYup);
        }
        // Optional: If user switches from 'Yes' back to 'No', you might want to clear the siblings array
        else if (watchHasSibling === 'No' && siblingFields.length > 0) {
            // form.setValue('student_siblings', []); // This removes all siblings
            // Or remove all one by one if preferred:
            // siblingFields.forEach((_, index) => removeSibling(index)); // This might cause issues if not careful with indices
            // Safest is usually form.setValue
            form.setValue('student_siblings', []);
        }
    }, [watchHasSibling, appendSibling, siblingFields.length, form /*, removeSibling (if used in else) */]);
    // --- END useEffect ---

    // --- NEW: useEffect to auto-add first previous school ---
    useEffect(() => {
        if (watchStudiedPreviously === 'Yes' && schoolFields.length === 0) {
            appendSchool({
                prev_school_name: '',
                prev_school_board_affiliation: '', // Or a default from BOARD_AFFILIATION_OPTIONS
                prev_school_from_year: undefined,
                prev_school_to_year: undefined,
                prev_school_from_class: '', // Or a default from CLASS_LEVEL_OPTIONS
                prev_school_to_class: '',   // Or a default
                prev_school_country: 'India', // Or empty
                prev_school_zip_code: '',
                prev_school_report_card: undefined,
            } as unknown as IndividualPreviousSchoolDataYup); // Type assertion
        }
        // Optional: Clear previous schools if 'No' is selected
        // else if (watchStudiedPreviously === 'No' && schoolFields.length > 0) {
        //   form.setValue('previous_schools', []);
        // }
    }, [watchStudiedPreviously, appendSchool, schoolFields.length, form]);

    useEffect(() => {
        if (watchParentsAreLocalGuardians === 'No' && guardianDetailFields.length === 0) {
            appendGuardianDetail({
                guardian_relation_with_applicant: '', // Or a default like GUARDIAN_RELATION_OPTIONS[0]
                guardian_first_name: '',
                guardian_last_name: '',
                guardian_nationality: '',
                guardian_country_of_residence: '',
                guardian_contact_email: '',
                guardian_contact_phone: '',
                guardian_is_whatsapp_same: true,
                guardian_whatsapp_number: '',
                guardian_is_address_same_as_applicant: '',
                guardian_address_country: '',
                guardian_address_zipcode: '',
                guardian_address_state: '',
                guardian_address_city: '',
                guardian_address_line1: '',
                guardian_address_line2: '',
                guardian_education: '', // Or a default
                guardian_field_of_study: '',
            } as unknown as IndividualGuardianDetailDataYup);
        }
        // Optional: Clear guardians if 'Yes' is selected
        else if (watchParentsAreLocalGuardians === 'Yes' && guardianDetailFields.length > 0) {
            setValue('student_guardians', []);
        }
    }, [watchParentsAreLocalGuardians, appendGuardianDetail, guardianDetailFields.length, setValue]);

    useEffect(() => {
        if (watchCommCountry && watchCommZipcode && watchCommZipcode.length >= 3) {
            const countryObj = countries.all.find(c => c.name === watchCommCountry);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                const timerId = setTimeout(() => {
                    fetchAddressDetails(
                        countryISO2, // Pass ISO2 code
                        watchCommZipcode,
                        setCommStateOptions,
                        setCommCityOptions,
                        setIsCommAddressLoading,
                        setCommAddressError,
                        "comm_address_state",
                        "comm_address_city",
                        setValue,
                    );
                }, 800);
                return () => clearTimeout(timerId);
            } else {
                setCommStateOptions([]);
                setCommCityOptions([]);
                setCommAddressError("Invalid country selected or country code not found.");
                setValue("comm_address_state", "", { shouldValidate: false });
                setValue("comm_address_city", "", { shouldValidate: false });
            }
        } else {
            setCommStateOptions([]);
            setCommCityOptions([]);
            if (!watchCommZipcode) {
                setValue("comm_address_state", "", { shouldValidate: false });
                setValue("comm_address_city", "", { shouldValidate: false });
            }
            setCommAddressError(null);
        }
    }, [watchCommCountry, watchCommZipcode, setValue]);

    useEffect(() => {
        if (watchBillingCountry && watchBillingZipcode && watchBillingZipcode.length >= 3) {
            const countryObj = countries.all.find(c => c.name === watchBillingCountry);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                const timerId = setTimeout(() => {
                    fetchAddressDetails(
                        countryISO2, // Pass ISO2 code
                        watchBillingZipcode,
                        setBillStateOptions,
                        setBillCityOptions,
                        setIsBillAddressLoading,
                        setBillAddressError,
                        "billing_state",
                        "billing_city",
                        setValue,
                    );
                }, 800);
                return () => clearTimeout(timerId);
            } else {
                setBillStateOptions([]);
                setBillCityOptions([]);
                setBillAddressError("Invalid country selected or country code not found.");
                setValue("billing_state", "", { shouldValidate: false });
                setValue("billing_city", "", { shouldValidate: false });
            }
        } else {
            setBillStateOptions([]);
            setBillCityOptions([]);
            if (!watchBillingZipcode) {
                setValue("billing_state", "", { shouldValidate: false });
                setValue("billing_city", "", { shouldValidate: false });
            }
            setBillAddressError(null);
        }
    }, [watchBillingCountry, watchBillingZipcode, setValue]);
    // --- NEW: useEffect for Current School Address ---
    useEffect(() => {
        if (watchIsHomeSchooled === 'No' && watchCurrentSchoolCountry && watchCurrentSchoolZipcode && watchCurrentSchoolZipcode.length >= 3) {
            const countryObj = countries.all.find(c => c.name === watchCurrentSchoolCountry);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                const timerId = setTimeout(() => {
                    fetchAddressDetails(
                        countryISO2,
                        watchCurrentSchoolZipcode,
                        setCurrentSchoolStateOptions,
                        setCurrentSchoolCityOptions,
                        setIsCurrentSchoolAddressLoading,
                        setCurrentSchoolAddressError,
                        "current_school_state",
                        "current_school_city",
                        setValue,
                    );
                }, 800);
                return () => clearTimeout(timerId);
            } else {
                setCurrentSchoolStateOptions([]);
                setCurrentSchoolCityOptions([]);
                setCurrentSchoolAddressError("Invalid school country or country code not found.");
                form.setValue("current_school_state", "", { shouldValidate: false });
                form.setValue("current_school_city", "", { shouldValidate: false });
            }
        } else {
            setCurrentSchoolStateOptions([]);
            setCurrentSchoolCityOptions([]);
            if (!watchCurrentSchoolZipcode) {
                form.setValue("current_school_state", "", { shouldValidate: false });
                form.setValue("current_school_city", "", { shouldValidate: false });
            }
            setCurrentSchoolAddressError(null);
        }
    }, [watchIsHomeSchooled, watchCurrentSchoolCountry, watchCurrentSchoolZipcode, form]);
    // 3. Define submit handler (remains the same conceptually)
    const onSubmit: SubmitHandler<AdmissionRegistrationFormDataYup> = async (values) => {
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

            // const response = await fetch('http://test-qa-ihs.isha.in/student-register', {
            //     method: 'POST',
            //     credentials: 'include', // Important: sends cookies for authentication
            //     headers: {
            //         // Correct Content-Type for JSON
            //         'Content-Type': 'application/json'
            //     },
            //     // Send the stringified plain object, NOT FormData
            //     body: JSON.stringify(payload)
            // });

            // --- Check Response ---
            // if (!response.ok) {
            //     // Try to parse error response from Odoo
            //     let errorData;
            //     try {
            //         errorData = await response.json();
            //     } catch (e) {
            //         // If response is not JSON
            //         errorData = { message: response.statusText };
            //     }
            //     console.error("Submission Error:", response.status, errorData);
            //     alert(`Submission failed: ${errorData?.message || 'Unknown error'}`);
            //     return; // Stop execution on error
            // }

            // --- Handle Success ---
            // const successData = await response.json(); // Assuming Odoo returns JSON on success too
            // console.log("Form submitted successfully!", successData);
            alert("Form submitted successfully!"); // Or use a toast notification

        } catch (error) {
            console.error("Network or other fetch error:", error);
            alert("An error occurred while submitting the form. Please check your connection and try again.");
        }
    }

    // --- Render Helper for Fields ---
    const renderField = (fieldName: keyof AdmissionRegistrationFormDataYup, ff: any /* Frappe Field Def */) => {
        const options = ff.options || '';
        const fieldtype = ff.fieldtype || 'Data';
        const label = ff.label || fieldName;
        const reqd = ff.reqd || 0;
        const isRequired = reqd === 1;
        const placeholder = ff.placeholder !== undefined ? ff.placeholder : label
        const selectOptionsArray = Array.isArray(ff.options)
            ? ff.options
            : parseSelectOptions(ff.options as string | null | undefined);
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
                            <div>
                                {fieldName === "application_year" || fieldName === "applicant_user" ? (
                                    <Input
                                        value={field.value ?? ''}
                                        disabled
                                        className="bg-muted cursor-not-allowed"
                                    />
                                ) : fieldName === "applied_for" ? (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ''}
                                        onOpenChange={(isOpen) => {
                                            if (!isOpen) {
                                                field.onBlur(); // Crucial for isTouched
                                                if (form.getFieldState("applied_for").isTouched) {
                                                    form.trigger("applied_for");
                                                }
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Class II">Class II</SelectItem>
                                            <SelectItem value="Class V">Class V</SelectItem>
                                            <SelectItem value="Class VIII">Class VIII</SelectItem>
                                            <SelectItem value="Class XI">Class XI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : fieldName === 'age' ? (
                                    <Input
                                        {...field} // Spread field to get name, onBlur, etc.
                                        value={field.value === undefined || field.value === null ? '' : String(field.value)} // Display as string, handle undefined/null
                                        readOnly // Make it read-only
                                        disabled // Visually indicate it's not editable
                                        className="bg-muted cursor-not-allowed"
                                        type="number" // Optional: helps with some browser UI for numbers, but readOnly is key
                                    />
                                ) : (
                                    <>
                                        {fieldtype === 'Data' && options === 'Email' && <Input type="email" placeholder={label} {...field} value={field.value ?? ''} />}
                                        {fieldtype === 'Data' && options !== 'Email' && <Input placeholder={label} {...field} value={field.value ?? ''} />}
                                        {fieldtype === 'Phone' && <Input type="tel" placeholder={label} {...field} value={field.value ?? ''} />}
                                        {fieldtype === 'Small Text' && <Textarea placeholder={placeholder} {...field} value={field.value ?? ''} />}
                                        {fieldtype === 'Date' && (
                                            <Input type="date" placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} />
                                        )}
                                        {fieldtype === 'Select' && (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''}
                                                onOpenChange={(isOpen) => {
                                                    if (!isOpen) {
                                                        field.onBlur();
                                                        if (getFieldState(fieldName).isTouched) {
                                                            trigger(fieldName);
                                                        }
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Select ${label}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectOptionsArray.map((opt: string) => ( // Use the processed selectOptionsArray
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
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="file"
                                                    className='pt-1.5 flex-grow'
                                                    accept="application/pdf,image/jpeg,image/png"
                                                    onChange={(e) => {
                                                        const file = e.target.files ? e.target.files[0] : null;
                                                        field.onChange(file);
                                                    }}
                                                />
                                                {field.value && field.value instanceof File && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreviewFile(field.value)}
                                                        className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:hover:bg-muted"
                                                        aria-label="Preview file"
                                                        title="Preview file"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
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
                                        {/* --- NEW: PhoneInput fieldtype --- */}
                                        {fieldtype === 'PhoneInput' && (
                                            <PhoneInput
                                                {...field} // Spread field to pass value and onChange
                                                // onChange={(value) => field.onChange(value || "")} // Already handled by your PhoneInput
                                                // Optional: set a default country
                                                placeholder={placeholder}
                                                className={ff.className} // Allow passing custom className
                                            // value={field.value ?? ""} // Ensure value is string
                                            />
                                        )}
                                        {fieldtype === 'CountrySelect' && (
                                            <CountryDropdown
                                                value={field.value} // field.value is the country name string
                                                onChange={(country?: Country) => { // Updated to accept Country or undefined
                                                    field.onChange(country?.name || ""); // Pass name or empty string
                                                }}
                                                onBlur={field.onBlur} // <-- PASS THE BLUR HANDLER
                                                placeholder={placeholder || `Select ${label}`}
                                                disabled={ff.read_only}
                                            // name={field.name} // RHF automatically passes name
                                            // ref={field.ref} // RHF automatically passes ref via PopoverTrigger asChild > button
                                            />
                                        )}
                                    </>
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
        "subjects", // <-- Add new tab key here
        "declaration",
        "billing"
    ];
    const [tab, setTab] = useState(TAB_KEYS[0]);
    const tabIndex = TAB_KEYS.indexOf(tab);
    const isFirstTab = tabIndex === 0;
    const isLastTab = tabIndex === TAB_KEYS.length - 1;

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [tab]);
    console.log("form state errors", form.formState.errors, form.formState.isValid, watch());

    return (
        <Form {...form}>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="w-full flex flex-wrap justify-between mb-4 overflow-x-auto">
                    <TabsTrigger value="instruction" className="flex-1 min-w-[120px]">Instructions</TabsTrigger>
                    <TabsTrigger value="personal" className="flex-1 min-w-[120px]">Personal</TabsTrigger>
                    <TabsTrigger value="academic" className="flex-1 min-w-[120px]">Academic</TabsTrigger>
                    <TabsTrigger value="health" className="flex-1 min-w-[120px]">Health</TabsTrigger>
                    <TabsTrigger value="parents" className="flex-1 min-w-[120px]">Parents</TabsTrigger>
                    {watchAppliedFor === 'Class XI' && <TabsTrigger value="subjects" className="flex-1 min-w-[120px]">Preferences</TabsTrigger>}
                    <TabsTrigger value="declaration" className="flex-1 min-w-[120px]">Declaration</TabsTrigger>
                    <TabsTrigger value="billing" className="flex-1 min-w-[120px]">Payment</TabsTrigger>
                </TabsList>
                {/* @ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly */}
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
                                {renderField("applied_for", { label: "Application For", fieldtype: "Select", options: "Class II\nClass V\nClass VIII\nClass XI", reqd: 1 })}
                                {renderField("applicant_user", { label: "Admission Number", fieldtype: "Link", options: "User", read_only: 1 })}

                                {/* Previous Application */}
                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Previous Application</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("applied_to_ihs_before", { label: "Have you applied to Isha Home School before?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                        {watchAppliedBefore === 'Yes' && (
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="previous_application_application_year"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>Previous Application Year<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onOpenChange={(isOpen) => {
                                                                    if (!isOpen) {
                                                                        field.onBlur();
                                                                        if (getFieldState('previous_application_application_year').isTouched) {
                                                                            trigger('previous_application_application_year');
                                                                        }
                                                                    }
                                                                }}
                                                                onValueChange={field.onChange} value={field.value ?? ''}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Year" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getLastNAcademicYears(5).map(opt => (
                                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {watchAppliedBefore === 'Yes' && (
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="previous_application_applied_for"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>Previously Applied For Grade<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onOpenChange={(isOpen) => {
                                                                    if (!isOpen) {
                                                                        field.onBlur();
                                                                        if (getFieldState('previous_application_applied_for').isTouched) {
                                                                            trigger('previous_application_applied_for');
                                                                        }
                                                                    }
                                                                }}
                                                                onValueChange={field.onChange} value={field.value ?? ''}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Grade" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {appliedForOptions.map(opt => (
                                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {watchAppliedBefore === 'Yes' && renderField("previous_application_remarks", { label: "Previous Application Remarks", fieldtype: "Data", reqd: 1 })}
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("first_name", { label: "First Name", fieldtype: "Data", reqd: 1 })}
                                        {renderField("middle_name", { label: "Middle Name", fieldtype: "Data" })}
                                        {renderField("last_name", { label: "Last Name", fieldtype: "Data", reqd: 1 })}
                                        {renderField("gender", { label: "Gender", fieldtype: "Select", options: "\nMale\nFemale\nOther", reqd: 1 })}
                                        {/* --- Country Dropdowns --- */}
                                        {renderField("nationality", {
                                            label: "Nationality",
                                            fieldtype: "CountrySelect",
                                            reqd: 1, // Assuming it's required
                                            placeholder: "Select country"
                                        })}
                                        {renderField("country_of_residence", {
                                            label: "Country of Residence",
                                            fieldtype: "CountrySelect",
                                            reqd: 1,
                                            placeholder: "Select country"
                                        })}
                                        {renderField("country", {
                                            label: "Country of Birth",
                                            fieldtype: "CountrySelect",
                                            reqd: 1,
                                            placeholder: "Select country"
                                        })}
                                        {/* --- End Country Dropdowns --- */}
                                        {renderField("date_of_birth", { label: "Date of Birth", fieldtype: "Date", reqd: 1 })}
                                        {/* Age field is likely read-only or calculated, omit from render helper if not editable */}
                                        {renderField("age", { label: "Age", fieldtype: "Data", reqd: 1 })}
                                    </div>
                                </div>



                                {/* Communication Address - Span across columns */}
                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Communication Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        <FormField
                                            //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                            control={form.control}
                                            name="comm_address_country"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>Country<span className="text-destructive"> *</span></FormLabel>
                                                    <FormControl>
                                                        <CountryDropdown
                                                            value={field.value}
                                                            onBlur={field.onBlur} // Add onBlur here too!
                                                            onChange={(country: Country | undefined) => {
                                                                field.onChange(country?.name || "");
                                                                // When country changes, clear zipcode, state, city and their options
                                                                setValue("comm_address_area_code", "");
                                                                setValue("comm_address_state", "");
                                                                setValue("comm_address_city", "");
                                                                setCommStateOptions([]);
                                                                setCommCityOptions([]);
                                                                setCommAddressError(null);
                                                            }}
                                                            placeholder="Select country"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* Zipcode Text Box */}
                                        <FormField
                                            //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormData exactly
                                            control={form.control}
                                            name="comm_address_area_code" // Assuming this is your zipcode field
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>Area Code/ Pincode<span className="text-destructive"> *</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter zipcode"
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            type="text" // Use text for alphanumeric zipcodes
                                                            disabled={!watchCommCountry} // Disable if no country is selected
                                                        />
                                                    </FormControl>
                                                    {isCommAddressLoading && <FormDescription>Loading address details...</FormDescription>}
                                                    {commAddressError && <FormMessage>{commAddressError}</FormMessage>}
                                                    {!commAddressError && <FormMessage />} {/* Placeholder for Zod error */}
                                                </FormItem>
                                            )}
                                        />
                                        {/* State Dropdown */}
                                        <FormField
                                            //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                            control={form.control}
                                            name="comm_address_state"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        disabled={isCommAddressLoading || commStateOptions.length === 0 || !watchCommZipcode}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isCommAddressLoading ? "Loading..." : "Select state"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {commStateOptions.length > 0 ? (
                                                                commStateOptions.map(stateName => (
                                                                    <SelectItem key={stateName} value={stateName}>{stateName}</SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-options" disabled>
                                                                    {watchCommZipcode ? "No states found or enter valid zipcode" : "Enter zipcode first"}
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* City Dropdown */}
                                        <FormField
                                            //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                            control={form.control}
                                            name="comm_address_city"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>City/ Town<span className="text-destructive"> *</span></FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        disabled={isCommAddressLoading || commCityOptions.length === 0 || !watchCommZipcode}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isCommAddressLoading ? "Loading..." : "Select city/town"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {commCityOptions.length > 0 ? (
                                                                commCityOptions.map(cityName => (
                                                                    <SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-options" disabled>
                                                                    {watchCommZipcode ? "No cities found or enter valid zipcode" : "Enter zipcode first"}
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {renderField("comm_address_line_1", { label: "Address Line 1", fieldtype: "Data", reqd: 1 })}
                                        {renderField("comm_address_line_2", { label: "Address Line 2", fieldtype: "Data" })}
                                    </div>
                                </div>

                                {/* Other Personal Info */}
                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Ohter Personal Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("identification_mark_1", { label: "Identification Mark 1", fieldtype: "Data", reqd: 1 })}
                                        {renderField("identification_mark_2", { label: "Identification Mark 2", fieldtype: "Data", reqd: 1 })}
                                        {renderField("religion", { label: "Religion", fieldtype: "Select", options: "\nHindu\nMuslim\nChristian\nSikh\nJew\nOther", reqd: 1 })}
                                        {watchReligion === 'Other' && renderField("other_religion", { label: "Other Religion", fieldtype: "Data", mandatory_depends_on: "Other", reqd: 1 })}
                                        {renderField("community", { label: "Community", fieldtype: "Select", options: "\nOC\nBC\nBC-Others\nMBC\nSC-Arunthathiyar\nSC-Others\nDNC (Denotified Communities)\nST\nOther", reqd: 1 })}
                                        {watchCommunity === 'Other' && renderField("other_community", { label: "Other Community", fieldtype: "Data", mandatory_depends_on: "Other", reqd: 1 })}
                                    </div>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Languages</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("mother_tongue", {
                                            label: "Mother Tongue",
                                            fieldtype: "Select",
                                            options: LANGUAGE_OPTIONS, // <-- Pass the array directly
                                            reqd: 1
                                        })}
                                        {watchMotherTongue === 'Other' && renderField("other_mother_tongue", {
                                            label: "Specify Mother Tongue",
                                            fieldtype: "Data",
                                            reqd: 1
                                        })}
                                    </div>
                                </div>
                                {/* Languages */}

                                {/* Sibling Info Question */}
                                <LanguagesKnownSection
                                    control={form.control}
                                    fields={languageFields}
                                    append={appendLanguage}
                                    remove={removeLanguage}
                                />

                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Sibling Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("has_sibling_in_ihs", { label: "Does the Applicant have a sibling studying/ studied in IHS?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    </div>
                                </div>
                                {/* --- Conditional Sibling Table Section --- */}
                                {watchHasSibling === 'Yes' && (
                                    <StudentSiblingsSection
                                        control={form.control}
                                        fields={siblingFields}
                                        append={appendSibling}
                                        remove={removeSibling}
                                    />
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
                                            {renderField("current_school_name", { label: "School Name", fieldtype: "Data", mandatory_depends_on: "No", reqd: 1 })}
                                            {/* Board Affiliation as dropdown */}
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="current_school_board_affiliation"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>Board Affiliation<span className="text-destructive"> *</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Board" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {BOARD_OPTIONS_YUP.map(board => (
                                                                    <SelectItem key={board} value={board}>
                                                                        {board}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* {renderField("board_affiliation_data2", { label: "Board Affiliation", fieldtype: "Data", mandatory_depends_on: "No" })} Assuming data2 is correct */}
                                            {renderField("current_school_phone_number", { label: "School Phone Number", fieldtype: "PhoneInput", reqd: watchIsHomeSchooled === 'No' ? 1 : 0, placeholder: "Enter school phone" })}
                                            {renderField("current_school_email_address", { label: "School Email Address", fieldtype: "Data", options: "Email", mandatory_depends_on: "No", reqd: 1 })}
                                            {/* {renderField("current_school_country", { label: "School Country", fieldtype: "Link", options: "Country", mandatory_depends_on: "No" })} */}
                                            {/* {renderField("current_school_area_code", { label: "School Area Code/ Pincode", fieldtype: "Data" })} */}
                                            {/* {renderField("current_school_city", { label: "School City/ Town", fieldtype: "Data", mandatory_depends_on: "No" })} */}
                                            {/* {renderField("current_school_state", { label: "School State", fieldtype: "Data" })} */}
                                            {/* --- NEW: Current School Country Dropdown --- */}
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="current_school_country" // Make sure this name matches your Zod schema exactly
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School Country<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <CountryDropdown
                                                                value={field.value} // Assuming field.value is the country name string
                                                                onBlur={field.onBlur}
                                                                onChange={(country: Country | undefined) => {
                                                                    field.onChange(country?.name || "");
                                                                    // When country changes, clear school zipcode, state, city and their options
                                                                    form.setValue("current_school_area_code", "");
                                                                    form.setValue("current_school_state", "");
                                                                    form.setValue("current_school_city", "");
                                                                    setCurrentSchoolStateOptions([]);
                                                                    setCurrentSchoolCityOptions([]);
                                                                    setCurrentSchoolAddressError(null);
                                                                }}
                                                                placeholder="Select school country"
                                                                disabled={String(watchIsHomeSchooled) === 'Yes'}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* --- NEW: Current School Zipcode Text Box --- */}
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="current_school_area_code"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School Area Code/ Pincode<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter school zipcode"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                type="text"
                                                                disabled={!watchCurrentSchoolCountry || String(watchIsHomeSchooled) === 'Yes'}
                                                            />
                                                        </FormControl>
                                                        {isCurrentSchoolAddressLoading && <FormDescription>Loading address...</FormDescription>}
                                                        {currentSchoolAddressError && <FormMessage>{currentSchoolAddressError}</FormMessage>}
                                                        {!currentSchoolAddressError && <FormMessage />} {/* For Zod errors */}
                                                    </FormItem>
                                                )}
                                            />

                                            {/* --- NEW: Current School State Dropdown --- */}
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="current_school_state"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School State<span className="text-destructive"> *</span></FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value ?? ''}
                                                            disabled={isCurrentSchoolAddressLoading || currentSchoolStateOptions.length === 0 || !watchCurrentSchoolZipcode || watchIsHomeSchooled === 'Yes'}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={isCurrentSchoolAddressLoading ? "Loading..." : "Select school state"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {currentSchoolStateOptions.length > 0 ? (
                                                                    currentSchoolStateOptions.map(stateName => (
                                                                        <SelectItem key={stateName} value={stateName}>{stateName}</SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="no-options-current-school-state" disabled>
                                                                        {watchCurrentSchoolZipcode ? "No states or enter valid zipcode" : "Enter school zipcode"}
                                                                    </SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* --- NEW: Current School City Dropdown --- */}
                                            <FormField
                                                control={form.control}
                                                name="current_school_city"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School City/ Town<span className="text-destructive"> *</span></FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value ?? ''}
                                                            disabled={isCurrentSchoolAddressLoading || currentSchoolCityOptions.length === 0 || !watchCurrentSchoolZipcode || watchIsHomeSchooled === 'Yes'}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={isCurrentSchoolAddressLoading ? "Loading..." : "Select school city/town"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {currentSchoolCityOptions.length > 0 ? (
                                                                    currentSchoolCityOptions.map(cityName => (
                                                                        <SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="no-options-current-school-city" disabled>
                                                                        {watchCurrentSchoolZipcode ? "No cities or enter valid zipcode" : "Enter school zipcode"}
                                                                    </SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {renderField("current_school_a_line1", { label: "School Address Line 1", fieldtype: "Data", mandatory_depends_on: "No", reqd: 1 })}
                                            {renderField("current_school_a_line2", { label: "School Address Line 2", fieldtype: "Data" })}
                                        </div>
                                    </div>
                                )}

                                {/* Previous School Info */}
                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Previous Schooling History</h3> {/* Changed heading slightly */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mb-4"> {/* Added mb-4 */}
                                        <FormField
                                            //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                            control={form.control}
                                            name="been_to_school_previously"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>Studied previously in any school?<span className="text-destructive"> *</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                        <SelectTrigger><SelectValue placeholder="Select Yes or No" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Yes">Yes</SelectItem>
                                                            <SelectItem value="No">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {watchStudiedPreviously === 'Yes' && (
                                        <PreviousSchoolsSection
                                            control={form.control}
                                            fields={schoolFields}       // Pass fields
                                            append={appendSchool}       // Pass append
                                            remove={removeSchool}       // Pass remove
                                            handlePreviewFile={handlePreviewFile}
                                        />
                                    )}
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
                                    {renderField("done_smallpox_vaccine", { label: "Is Applicant Protected from Smallpox?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_measles_vaccine", { label: "Is Applicant Protected from Measles?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_hepatitis_a_vaccine", { label: "Is Applicant Protected from Hepatitis A?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_hepatitis_b_vaccine", { label: "Is Applicant Protected from Hepatitis B?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_tdap_vaccine", { label: "Is Applicant Protected from Tdap?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_polio_vaccine", { label: "Is Applicant Protected from Polio?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_mumps_vaccine", { label: "Is Applicant Protected from Mumps?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_rubella_vaccine", { label: "Is Applicant Protected from Rubella?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_typhoid_vaccine", { label: "Is Applicant Protected from Typhoid?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("done_varicella_vaccine", { label: "Is Applicant Protected from Varicella?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {renderField("other_vaccines", { label: "Other Vaccinations", fieldtype: "Data" })}
                                    {renderField("vaccine_certificates", { label: "Vaccine Certificate(s)", fieldtype: "Attach", reqd: 1 })}
                                </div>

                                {/* Additional Health */}
                                <h3 className="font-medium text-md pt-4 border-t mt-4">Additional Health Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                    {renderField("blood_group", { label: "Blood Group", fieldtype: "Select", options: "\nBlood Group A+\nBlood Group A-\nBlood Group B+\nBlood Group B-\nBlood Group O+\nBlood Group O-\nBlood Group AB+\nBlood Group AB-", reqd: 1 })}
                                    {renderField("wears_glasses_or_lens", { label: "Wears glasses or lenses?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchWearsGlasses === 'Yes' && renderField("right_eye_power", { label: "Right Eye Power", fieldtype: "Data", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {watchWearsGlasses === 'Yes' && renderField("left_eye_power", { label: "Left Eye Power", fieldtype: "Data", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {/* Hygiene for Class II */}
                                    {/* {watchAppliedFor === 'Class II' && renderField("is_toilet_trained", { label: "Is Applicant toilet-trained?", fieldtype: "Select", options: "\nYes\nNo", mandatory_depends_on: "Class II" })} */}
                                    {/* {watchAppliedFor === 'Class II' && renderField("wets_bed", { label: "Does Applicant bed-wet?", fieldtype: "Select", options: "\nYes\nNo", mandatory_depends_on: "Class II" })} */}
                                </div>

                                {/* Hygiene & Sleep Habits */}
                                {watchAppliedFor === 'Class II' && <><h3 className="font-medium text-md pt-4 border-t mt-4">Hygiene & Sleep Habits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("is_toilet_trained", { label: "Is the Applicant Toilet trained?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                        {renderField("wets_bed", { label: "Does the Applicant wet Bed?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                        {watchWetsBed === 'Yes' && renderField("bed_wet_frequency", { label: "Bed Wet Frequency", fieldtype: "Data", reqd: 1 })} {/* reqd: 1 for asterisk, Zod handles actual requirement */}
                                    </div></>}

                                {/* Challenges */}
                                <h3 className="font-medium text-md pt-4 border-t mt-4">Physical & Mental Health</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {renderField("has_hearing_challenges", { label: "Does the applicant have any hearing challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchHearing === 'Yes' && renderField("hearing_challenges", { label: "Hearing Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("has_physical_challenges", { label: "Does the applicant have any physical challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchPhysical === 'Yes' && renderField("physical_challenges", { label: "Physical Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("has_speech_challenges", { label: "Does the applicant have any speech challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchSpeech === 'Yes' && renderField("speech_challenges", { label: "Speech Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("has_behavioural_challenges", { label: "Does the applicant have any psych./behavioural challenges?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchBehavioural === 'Yes' && renderField("behavioural_challenges", { label: "Psych./Behavioural Challenges Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                </div>

                                {/* Medical History */}
                                <h3 className="font-medium text-md pt-4 border-t mt-4">Medical History</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {renderField("has_injury", { label: "Does the applicant have history of any accident/ injury?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchInjury === 'Yes' && renderField("injury_details", { label: "Accident/ Injury Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("on_medication", { label: "Is the Applicant on regular medication? (Including Ayurvedic, Siddha, Homeopathic and Alternative Medicines)", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchMedication === 'Yes' && renderField("medication_details", { label: "Regular Medication Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {watchMedication === 'Yes' && renderField("medical_prescription", { label: "Medical Prescription", fieldtype: "Attach", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("has_health_issue", { label: "Does the applicant have History of any health Issue?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchHealthIssue === 'Yes' && renderField("health_issue_details", { label: "Health Issue Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("was_hospitalized", { label: "Does the applicant have history of any hospitalization and/ or surgery?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchHospitalized === 'Yes' && renderField("hospitalization_details", { label: "Hospitalization/ Surgery Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("needs_special_attention", { label: "Does the applicant have any other health issue that needs special attention?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchSpecialAttention === 'Yes' && renderField("attention_details", { label: "Special Attention Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("has_allergies", { label: "Does the applicant have any food/ drug allergies?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchAllergies === 'Yes' && renderField("allergy_details", { label: "Allergy Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                </div>
                            </div>
                        </section>
                    </TabsContent>
                    <TabsContent value="parents">
                        {/* === Section: Parents & Guardians === */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-semibold border-b pb-2">Parent & Guardian Information</h2>
                            <div className="space-y-8"> {/* Increased spacing between parent sections */}

                                <div className="space-y-8">
                                    {parentFields.map((parentItem, index) => (
                                        <StudentParentDetailSection
                                            key={parentItem.id}
                                            control={control}
                                            index={index}
                                            removeParent={removeParent}
                                            totalParents={parentFields.length}
                                            getValues={getValues}
                                            setValue={setValue}
                                        />
                                    ))}
                                </div>

                                {/* --- Add Parent Button (conditional, max 2 parents) --- */}
                                {parentFields.length < 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const newParentEntry: Partial<IndividualParentDetailDataYup> = { // Use Partial for type safety
                                                parent_first_name: '',
                                                parent_last_name: '',
                                                parent_relation: parentFields.length === 0 ? PARENT_RELATION_OPTIONS_YUP[0] : PARENT_RELATION_OPTIONS_YUP[1], // Suggests 'Father' then 'Mother'
                                                parent_nationality: undefined, // For CountryDropdown to show placeholder
                                                parent_country_of_residence: undefined, // For CountryDropdown
                                                parent_contact_email: '',
                                                parent_contact_phone: '', // PhoneInput usually handles empty string well
                                                parent_is_whatsapp_same: true, // Default boolean
                                                parent_whatsapp_number: '',    // Will be shown/required based on parent_is_whatsapp_same
                                                parent_is_address_same_as_applicant: undefined, // For Select to show placeholder
                                                // Address fields are optional in Yup schema if parent_is_address_same_as_applicant is 'Yes'
                                                // They will become required via .when() if it's 'No'.
                                                // So, their default can be undefined.
                                                parent_address_country: undefined,
                                                parent_address_zipcode: '', // Or undefined
                                                parent_address_state: undefined,
                                                parent_address_city: undefined,
                                                parent_address_line1: '', // Or undefined
                                                parent_address_line2: '', // Or undefined
                                                parent_education: undefined, // For Select to show placeholder
                                                parent_field_of_study: '',
                                                parent_profession: undefined, // For Select to show placeholder
                                                parent_organization_name: '',
                                                parent_designation: '',
                                                parent_annual_income: '',
                                            };
                                            appendParent(newParentEntry as IndividualParentDetailDataYup); // Cast needed because RHF append expects full type
                                        }}
                                        className="mt-6"
                                    >
                                        Add {parentFields.length === 0 ? 'First Parent' : 'Second Parent'}
                                    </Button>
                                )}
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
                                        {renderField("parents_are_local_guardians", { label: "Are Parents the Local Guardians?", fieldtype: "Select", options: "\nYes\nNo" })}
                                    </div>
                                    {watchParentsAreLocalGuardians === 'No' && (
                                        <div className="space-y-8 mt-4"> {/* Container for guardian cards */}
                                            {guardianDetailFields.map((guardianItem, index) => (
                                                <StudentGuardianDetailSection
                                                    key={guardianItem.id}
                                                    //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                    control={control}
                                                    index={index}
                                                    removeGuardian={removeGuardianDetail}
                                                    totalGuardians={guardianDetailFields.length}
                                                    getValues={getValues}
                                                    setValue={setValue}
                                                    fetchAddressDetails={fetchAddressDetails}
                                                />
                                            ))}
                                            {/* Allow adding multiple guardians if needed, or limit to 1 if that's the requirement */}
                                            {guardianDetailFields.length < 2 && <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => appendGuardianDetail({
                                                    guardian_relation_with_applicant: '', // Or a default like GUARDIAN_RELATION_OPTIONS[0]
                                                    guardian_first_name: '',
                                                    guardian_last_name: '',
                                                    guardian_nationality: '',
                                                    guardian_country_of_residence: '',
                                                    guardian_contact_email: '',
                                                    guardian_contact_phone: '',
                                                    guardian_is_whatsapp_same: true,
                                                    guardian_whatsapp_number: '',
                                                    guardian_is_address_same_as_applicant: '',
                                                    guardian_address_country: '',
                                                    guardian_address_zipcode: '',
                                                    guardian_address_state: '',
                                                    guardian_address_city: '',
                                                    guardian_address_line1: '',
                                                    guardian_address_line2: '',
                                                    guardian_education: '', // Or a default
                                                    guardian_field_of_study: '',
                                                } as unknown as IndividualGuardianDetailDataYup)}
                                                className="mt-6"
                                            >
                                                Add Local Guardian
                                            </Button>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </TabsContent>
                    <TabsContent value="subjects">
                        {/* === Section: Preferences & More (Conditional - Class XI) === */}
                        {watchAppliedFor === 'Class XI' ? (
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold border-b pb-2">Subject Preferences & Additional Questions (Class XI)</h2>
                                {/* --- Sub Description --- */}
                                <div className="mb-4">
                                    <p className="text-base mb-2">
                                        Please find below the available subject combinations, which are based on an in-house curriculum.
                                    </p>
                                    <p className="text-base mb-2">
                                        The school is affiliated to the Indian School Certificate (ISC) Program awarded by the Council for the Indian School Certificate Examinations (CISCE). Students can also opt to sit as private candidates for the National Institute of Open Schooling (NIOS) examinations.
                                    </p>
                                    <div className="mb-2">
                                        <span className="font-semibold">Core Subjects:</span>
                                        <ol className="list-decimal list-inside ml-4">
                                            <li>English</li>
                                            <li>Understanding India</li>
                                            <li>Yoga</li>
                                            <li>Socially Useful Productive Work (SUPW)</li>
                                        </ol>
                                    </div>
                                </div>
                                {/* ...existing subject selection and questions code... */}
                                <div className="space-y-6">
                                    <h3 className="font-medium text-md">Subject Selection</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                                        {renderField("group_a", { label: "Group A", fieldtype: "Select", options: "\nPhysics\nAccounts\nHistory", mandatory_depends_on: "Class XI", reqd: 1 })}
                                        {renderField("group_b", { label: "Group B", fieldtype: "Select", options: "\nChemistry\nEconomics", mandatory_depends_on: "Class XI", reqd: 1 })}
                                        {renderField("group_c", { label: "Group C", fieldtype: "Select", options: "\nBiology\nComputer Science\nCommerce\nPolitical Science", mandatory_depends_on: "Class XI", reqd: 1 })}
                                        {renderField("group_d", { label: "Group D", fieldtype: "Select", options: "\nMathematics\nEnvironmental Studies\nFine Arts", mandatory_depends_on: "Class XI", reqd: 1 })}
                                    </div>
                                    {/* Applicant Questions */}
                                    <h3 className="font-medium text-md pt-4 border-t mt-4">Note to Applicant</h3>
                                    <div className="mb-4">
                                        <p className="text-base mb-2">This questionnaire is designed so that we can get to know you a little better; there are no right or wrong answers. Please write the answers yourself, because it is YOU that we want
                                            to get to know. Please write in your own words, and resist the temptation to
                                            have someone else look over your shoulder as you do !</p>
                                        <p className="text-base mb-2">
                                            The answer to each question should be no more than 150 - 200 words.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Question 1</h4>
                                        {renderField("q1_applicant_response", { placeholder: "", label: "Why are you opting to enroll in the IHS Post-10 Program? What do you hope to gain in a 3 year program here, as opposed to regular 2 year program elsewhere?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 2</h4>
                                        {renderField("q2_applicant_response", { placeholder: "", label: "Can you talk us through the reasons behind the subject combination you have chosen? What do you see yourself doing in the future?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 3</h4>
                                        {renderField("q3_applicant_response", { placeholder: "", label: "What activity do you love doing the most? Why? It could be singing in the shower, talking on the telephone, exploring the further reaches of YouTube, anything (We are more interested in the why).", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 4</h4>
                                        {renderField("q4_applicant_response", { placeholder: "", label: "If you could change one thing about the world, what would it be, and why?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 5</h4>
                                        {renderField("q5_applicant_response", { placeholder: "", label: "If you could change one thing about yourself, what would it be, and why?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 6</h4>
                                        {renderField("q6_applicant_response", { placeholder: "", label: "Describe your dream vacation.", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 7</h4>
                                        {renderField("q7_applicant_response", { placeholder: "", label: "Is there anything else want to share with us but couldn’t write anywhere else? This is the place, but please don’t feel like you have to write something here. This question is optional.", fieldtype: "Small Text", reqd: 1 })}
                                    </div>
                                    {/* Parent Questions */}
                                    <h3 className="font-medium text-md pt-4 border-t mt-4">Note to Parent</h3>
                                    <div className="mb-4">
                                        <p className="text-base mb-2">Note to Parent(s)
                                            It is very helpful for us to learn about our applicants through their
                                            parents’ eyes. Your answers to these questions will help us to better understand
                                            your child’s social and educational needs. The answers can be filled jointly by both parents/
                                            guardians, or separately; the choice is entirely yours.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Question 1</h4>
                                        {renderField("q1_parent_response", { placeholder: "", label: "Please discuss your primary reason for considering the Isha Home School’s Post-10 Program for your child. What do you hope your child will gain in a 3 year program here, as opposed to regular 2 year program elsewhere? What are your expectations for your child's schooling experience (please also mention a few areas outside of academics)?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 2</h4>
                                        {renderField("q2_parent_response", { placeholder: "", label: "From what activities does your child derive self-confidence?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 3</h4>
                                        {renderField("q3_parent_response", { placeholder: "", label: "What are your child’s strengths and weaknesses? (Please comment on social characteristics: e.g., self-reliance, sense of humour, ability to mix, shyness, assertiveness, etc.)", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 4</h4>
                                        {renderField("q4_parent_response", { placeholder: "", label: "What are your thoughts about your child’s future educational and/or professional aspirations? Have you and your child charted out a particular trajectory or course? Is there a particular course that you would like your child to pursue? If so, why?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 5</h4>
                                        {renderField("q5_parent_response", { placeholder: "", label: "Discuss any particular concerns of which the school should be aware: e.g., Has your child experienced any difficult challenges or personal setbacks in recent years? Are there any medical conditions of which we should be aware? Does your child's health limit or interfere with the normal performance of everyday activities, including class work, athletics, or other duties?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 6</h4>
                                        {renderField("q6_parent_response", { placeholder: "", label: "Please make any additional comments about your child which you feel may be helpful to us.", fieldtype: "Small Text", reqd: 1 })}
                                    </div>
                                </div>
                            </section>
                        ) : (
                            <section>
                                <h2 className="text-xl font-semibold border-b pb-2">Subject Preferences & Additional Questions</h2>
                                <p className="text-muted-foreground">Subject selection and questions are only required for Class XI applicants.</p>
                            </section>
                        )}
                    </TabsContent>
                    <TabsContent value="declaration">
                        {/* === Section: Declaration === */}
                        <section className="space-y-6 pt-6 border-t">
                            <h2 className="text-xl font-semibold border-b pb-2">Declaration</h2>
                            {/* Add Declaration Text Here */}
                            {/* <p className="text-sm text-muted-foreground">
                [Declaration Text Block - Needs to be added based on actual requirements]
                I hereby declare that the information provided is true and correct to the best of my knowledge...
              </p> */}
                            <div className="flex items-start space-x-2">
                                <FormField
                                    //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                    control={form.control}
                                    name="declaration"
                                    render={({ field }) => (
                                        <FormItem className="flex items-start space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    id="declaration"
                                                    checked={!!field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <span className="text-base">
                                                I/ we hereby confirm that all information given in this application is complete and accurate to the best of our knowledge. We understand that the admission is substantially based on the information provided by us. We also understand that at any stage, if the information provided by us is found to be incorrect or that some information is suppressed, it will result in immediate action amounting to dismissal of our child with no fees refunded.
                                            </span>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-center"> {/* Center items vertically */}
                                {/* Checkbox needs custom label handling within renderField */}
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
                                    {renderField("billing_phone", { label: "Billing Phone", fieldtype: "PhoneInput", reqd: 1, placeholder: "Enter billing phone" })}
                                    {renderField("billing_email", { label: "Billing Email", fieldtype: "Data", options: "Email", reqd: 1 })}
                                    <FormField
                                        //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                        control={form.control}
                                        name="billing_country"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>Country<span className="text-destructive"> *</span></FormLabel>
                                                <FormControl>
                                                    <CountryDropdown
                                                        value={field.value}
                                                        onBlur={field.onBlur} // Add onBlur here too!
                                                        onChange={(country: Country | undefined) => {
                                                            field.onChange(country?.name || "");
                                                            // When country changes, clear zipcode, state, city and their options
                                                            setValue("billing_area_code", "");
                                                            setValue("billing_state", "");
                                                            setValue("billing_city", "");
                                                            setBillStateOptions([]);
                                                            setBillCityOptions([]);
                                                            setBillAddressError(null);
                                                        }}
                                                        placeholder="Select country"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Zipcode Text Box */}
                                    <FormField
                                        //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormData exactly
                                        control={form.control}
                                        name="billing_area_code"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>Area Code/ Pincode<span className="text-destructive"> *</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter zipcode"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        type="text" // Use text for alphanumeric zipcodes
                                                        disabled={!watchBillingCountry} // Disable if no country is selected
                                                    />
                                                </FormControl>
                                                {isBillAddressLoading && <FormDescription>Loading address details...</FormDescription>}
                                                {billAddressError && <FormMessage>{billAddressError}</FormMessage>}
                                                {!billAddressError && <FormMessage />} {/* Placeholder for Zod error */}
                                            </FormItem>
                                        )}
                                    />
                                    {/* State Dropdown */}
                                    <FormField
                                        //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                        control={form.control}
                                        name="billing_state"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value ?? ''}
                                                    disabled={isBillAddressLoading || billStateOptions.length === 0 || !watchBillingZipcode}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isBillAddressLoading ? "Loading..." : "Select state"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {billStateOptions.length > 0 ? (
                                                            billStateOptions.map(stateName => (
                                                                <SelectItem key={stateName} value={stateName}>{stateName}</SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="no-options" disabled>
                                                                {watchBillingZipcode ? "No states found or enter valid zipcode" : "Enter zipcode first"}
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* City Dropdown */}
                                    <FormField
                                        //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                        control={form.control}
                                        name="billing_city"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>City/ Town<span className="text-destructive"> *</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value ?? ''}
                                                    disabled={isBillAddressLoading || billCityOptions.length === 0 || !watchBillingZipcode}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isBillAddressLoading ? "Loading..." : "Select city/town"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {billCityOptions.length > 0 ? (
                                                            billCityOptions.map(cityName => (
                                                                <SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="no-options" disabled>
                                                                {watchBillingZipcode ? "No cities found or enter valid zipcode" : "Enter zipcode first"}
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {renderField("billing_address_l1", { label: "Billing Address Line 1", fieldtype: "Data", reqd: 1 })}
                                    {renderField("billing_address_l2", { label: "Billing Address Line 2", fieldtype: "Data" })}
                                </div>

                                {/* Payment Status (Read-only section) */}
                                <h3 className="font-medium text-md pt-4 border-t mt-4 opacity-70">Payment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 opacity-70 pointer-events-none">
                                    <p className=' text-base text-black'>Application Fee is 750rs</p>
                                    {/* {renderField("application_fee_status", { label: "Fee Status", fieldtype: "Select", options: "Pending\nIn Progress\nCompleted\nExpired", read_only: 1 })}
                                    {renderField("program", { label: "Program", fieldtype: "Link", options: "Program", read_only: 1 })} */}
                                    {/* Conditionally render or remove payment links table */}
                                    {/* {renderField("payment_program_links", { label: "Payment Links", fieldtype: "Table", options: "Payment Program Link", read_only: 1 })} */}
                                </div>
                            </div>
                        </section>
                    </TabsContent>
                    {isLastTab && (
                        <div className="flex justify-end pt-8 mt-8 border-t">
                            <Button type="submit" size="lg">
                                {form.formState.isSubmitting ? "Submitting..." : "Pay"}
                            </Button>
                        </div>
                    )}
                </form>
                {/* Navigation Buttons OUTSIDE the form to prevent accidental submit */}
                {tab !== "instruction" && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 mt-8 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                // If current tab is "declaration" and Class XI is NOT selected, skip "subjects" tab when going back
                                if (
                                    tab === "declaration" &&
                                    watchAppliedFor !== "Class XI"
                                ) {
                                    setTab("parents");
                                } else {
                                    setTab(TAB_KEYS[tabIndex - 1]);
                                }
                            }}
                            disabled={isFirstTab}
                        >
                            Back
                        </Button>
                        {!isLastTab && (
                            <Button
                                type="button"
                                onClick={async () => {
                                    // If current tab is "parents" and Class XI is NOT selected, skip "subjects" tab
                                    if (
                                        tab === "parents" &&
                                        watchAppliedFor !== "Class XI"
                                    ) {
                                        setTab("declaration");
                                    } else {
                                        setTab(TAB_KEYS[tabIndex + 1]);
                                    }
                                }}
                            >
                                Next
                            </Button>
                        )}
                    </div>
                )}
            </Tabs>
            {/* File Preview Modal using Shadcn Dialog */}
            {previewFile && (
                <Dialog open={isPreviewModalOpen} onOpenChange={handleModalOpenChange}>
                    <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="truncate pr-10">{previewFile.name}</DialogTitle>
                            {/* DialogClose is typically used outside, but we can style a button like it */}
                        </DialogHeader>
                        <div className="flex-grow overflow-auto py-4">
                            {previewFile.type.startsWith('image/') ? (
                                <img src={previewFile.url} alt="File preview" className="max-w-full max-h-[70vh] mx-auto object-contain" />
                            ) : previewFile.type === 'application/pdf' ? (
                                <embed src={previewFile.url} type="application/pdf" className="w-full h-[75vh] min-h-[300px] sm:min-h-[500px]" />
                            ) : (
                                <p className="text-muted-foreground text-center py-10">Preview not available for this file type ({previewFile.type}).</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Form>
    );
}