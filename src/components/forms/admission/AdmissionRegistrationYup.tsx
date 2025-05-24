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

import {
    BOARD_OPTIONS_YUP,
    calculateAge, fetchAddressDetails,
    getCurrentAcademicYear, getLastNAcademicYears,
    LANGUAGE_OPTIONS, PARENT_RELATION_OPTIONS_YUP, TAB_ORDER, TAB_FIELD_GROUPS, get
} from './admissionFormTabUtils';
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

const appliedForOptions = ['Class II', 'Class V', 'Class VIII', 'Class XI'];


export function AdmissionRegistrationForm() {
    const [currentTab, setCurrentTab] = useState<string>(TAB_ORDER[0]);
    const [enabledTabs, setEnabledTabs] = useState<Set<string>>(
        new Set([
            TAB_ORDER[0],
            TAB_ORDER[1],
            TAB_ORDER[2],
            TAB_ORDER[3],
            TAB_ORDER[4],
            TAB_ORDER[5],
            TAB_ORDER[6],
            TAB_ORDER[7],
        ]) // "instruction" and "personal" initially enabled
    );
    const [isCommAddressLoading, setIsCommAddressLoading] = useState(false);
    const [commAddressError, setCommAddressError] = useState<string | null>(null);
    const [isBillAddressLoading, setIsBillAddressLoading] = useState(false);
    const [billAddressError, setBillAddressError] = useState<string | null>(null); // <-- Updated variable name
    // --- NEW: For Current School Address ---
    const [isCurrentSchoolAddressLoading, setIsCurrentSchoolAddressLoading] = useState(false);
    const [currentSchoolAddressError, setCurrentSchoolAddressError] = useState<string | null>(null);
    // 1. Define form with updated default values
    const form = useForm<AdmissionRegistrationFormDataYup>({
        // @ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
        resolver: yupResolver(admissionRegistrationSchemaYup),
        // Updated default values reflecting the flattened schema for parents/siblings
        defaultValues: {
            application_academic_year: getCurrentAcademicYear(),
            application_for: 'Class V', // Default from appliedForOptions
            applied_to_ihs_before: 'No',
            // previous_applied_year: previousApplicationYears[0] || '', // Default to most recent or empty
            // previous_applied_for: 'Class II', // Default from appliedForOptions
            // previous_applied_comments: '',
            first_name: 'Jhon',
            middle_name: '',
            last_name: 'Sue',
            gender: 'Male', // Or '' or one of GENDER_OPTIONS
            nationality: 'India',
            country_of_residence: 'India',
            country_of_birth: 'India', // Country of Birth
            // date_of_birth: new Date('2010-01-01'), // Example past date
            // age: 14, // Example, or calculate based on DOB
            // address_country: 'India',
            // address_zip_code: '110001',
            address_line_1: 'Plot 403/404 Nakawa Industrial Area, P.O. Box 9547',
            // address_line_2: 'Apt 1',
            // address_city: 'New Delhi',
            // address_state: 'Delhi',
            religion: 'Other', // Default from RELIGION_OPTIONS
            community: 'OC',   // Default from COMMUNITY_OPTIONS
            identification_mark_1: 'Scar on KNee',
            identification_mark_2: 'Scar on forehead',
            other_religion: 'Akhand bharat',
            // other_community: '',
            mother_tongue: 'Other', // Example
            other_mother_tongue: 'Njerep',
            student_languages: [
                { language: 'Hindi', proficiency: 'Advanced' },
                { language: 'Other', proficiency: 'Advanced', other_language: 'Njerep' },
            ],
            has_sibling_in_ihs: 'No',
            student_siblings: [], // Will be auto-populated by useEffect if has_sibling_in_ihs is 'Yes' initially
            // recent_photo: undefined,
            // birth_certificate: undefined,
            // id_proof_type: 'Aadhaar Card', // Default from ID_PROOF_OPTIONS
            // id_proof_document: undefined,
            // aadhaar_number: '', // Example: '123456789012' - conditionally required
            // passport_number: '',
            // passport_place_of_issue: '',
            // passport_date_of_issue: '',
            // passport_date_of_expiry: '',
            is_home_schooled: 'No',
            current_school_name: 'Delhi Public School',
            current_school_board_affiliation: 'State Board', // Default from BOARD_AFFILIATION_OPTIONS
            current_school_phone_number: '+919988776655', // E.164 format
            current_school_country: 'India',
            current_school_zip_code: '110002',
            current_school_city: 'New Delhi',
            current_school_state: 'Delhi',
            current_school_email_address: 'currentschool@example.com',
            current_school_address_line1: '456 School Rd',
            current_school_address_line2: '',
            // was_the_applicant_ever_home_schooled: 'No',
            // been_to_school_previously: 'No', // Set to No so previous_schools_table is initially empty
            previous_schools: [],
            academic_strengths_and_weaknesses: 'Strong in sciences.',
            hobbies_interests_and_extra_curricular: 'Reading, Chess.',
            other_details_of_importance: '',
            temperament_and_personality: 'Inquisitive and calm.',
            learning_disability: 'None reported.',
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
            // other_vaccines: '',
            // vaccine_certificates: undefined,
            blood_group: 'Blood Group A+', // Default from BLOOD_GROUP_OPTIONS
            wears_glasses_or_lens: 'No',
            // right_eye_power: '',
            // left_eye_power: '',
            toilet_trained: 'Yes', // Relevant if application_for is Class II
            // bed_wet: 'No',           // Relevant if application_for is Class II
            has_hearing_challenges: 'No',
            // hearing_challenges: '',
            has_behavioural_challenges: 'No',
            behavioural_challenges: '',
            has_physical_challenges: 'No',
            physical_challenges: '',
            has_speech_challenges: 'No',
            speech_challenges: '',
            history_of_accident_injury: 'No',
            history_of_accident_injury_details: '',
            regular_medication: 'No',
            regular_medication_details: '',
            medical_prescription: undefined,
            history_of_health_issues: 'No',
            history_of_health_issues_details: '',
            surgery_hospitalization: 'No',
            surgery_hospitalization_details: '',
            special_attention: 'No',
            special_attention_details: '',
            has_allergies: 'No',
            allergies_details: '',
            student_parent: [
                {
                    // first_name: 'Parent1 First',
                    // last_name: 'Parent1 Last',
                    // relation: 'Father', // Default from PARENT_RELATION_OPTIONS
                    // nationality: 'India',
                    // country_of_residence: 'India',
                    // contact_email: 'parent1@example.com',
                    // contact_phone: '+919123456780', // E.164
                    // is_whatsapp_same: true as boolean,
                    // whatsapp_phone: '',
                    // is_address_same_as_applicant: 'Yes',
                    // address_country: '', // Copied if 'Yes'
                    // address_zipcode: '',
                    // address_state: '',
                    // address_city: '',
                    // address_line1: '',
                    // address_line2: '',
                    // education: 'Graduate', // Default from PARENT_EDUCATION_LEVEL_OPTIONS
                    // field_of_study: 'Business Administration',
                    // profession: 'Businessman/ Entrepreneur', // Default from PARENT_PROFESSION_OPTIONS
                    // organization_name: 'Parent1 Inc.',
                    // designation: 'Director',
                    // annual_income: '2500000',
                }
                // You can add a second default parent object here if needed
                // ,{
                //   first_name: 'Parent2 First',
                //   last_name: 'Parent2 Last',
                //   relation: 'Mother',
                //   ... (similarly fill all fields)
                // }
            ],
            marital_status: 'Divorced', // Default from PARENT_MARITAL_STATUS_OPTIONS
            // who_is_responsible_for_paying_applicants_tuition_fee: 'Both', // Default from options
            // court_order_document: undefined,
            // who_is_allowed_to_receive_communication: 'Both',
            // legal_rights_document: undefined,
            // who_is_allowed_to_receive_report_cards: 'Both',
            // who_is_allowed_to_visit_school: 'Both',
            parents_are_local_guardians: 'Yes', // Default to Yes, so guardian section is initially hidden
            student_guardians: [],            // Will be auto-populated by useEffect if parents_are_local_guardians is 'No'
            // group_a: undefined, // For Class XI
            // group_b: undefined,
            // group_c: undefined,
            // group_d: undefined,
            // response_why_ihs_post_10th: '', response_subject_combination: '', response_activity_love_to_do_most: '', response_change_one_thing_about_world: '',
            // response_change_one_thing_about_yourself: '', response_dream_vacation: '', response_additional_comments_optional: '',
            // parents_response_why_ihs_post_10th: '', parents_response_childs_self_confidence: '', parents_response_strengths_weaknesses: '', parents_response_child_future_education_plan: '',
            // parents_response_on_childs_concerns: '', parents_response_additional_comments: '',
            // agree_declaration: false, // Should typically default to false
            // date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
            // place: 'Default City',
            billing_first_name: 'Jhon', // Updated billing name
            billing_last_name: 'Doe JIJOE', // Updated billing last name
            billing_mobile: '+919000000000', // E.164
            billing_email: 'billing@example.com',
            billing_country: 'India',
            billing_zip_code: '110001',
            billing_city: 'New Delhi',
            billing_state: 'Delhi',
            billing_address_line1: '789 Billing St',
            billing_address_lin2: '',
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
    const watchAppliedFor = form.watch("application_for");
    const watchHasSibling = form.watch("has_sibling_in_ihs"); // Used for sibling section visibility
    const watchIdProof = form.watch("id_proof_type");
    const watchIsHomeSchooled = form.watch("is_home_schooled");
    const watchStudiedPreviously = form.watch("been_to_school_previously");
    const watchedDateOfBirth = form.watch("date_of_birth");

    //To auto Fill the State and City based on the country selected
    const watchCommCountry = form.watch("address_country");
    const watchCommZipcode = form.watch("address_zip_code");

    const watchBillingCountry = form.watch("billing_country");
    const watchBillingZipcode = form.watch("billing_zip_code");

    // Watch fields for Current School Address
    const watchCurrentSchoolBoardAffiliation = form.watch("current_school_board_affiliation");
    const watchCurrentSchoolCountry = form.watch("current_school_country"); // Make sure this field exists in schema/form
    const watchCurrentSchoolZipcode = form.watch("current_school_zip_code");

    // const watchCurrentSchoolState = form.watch("current_school_state");
    const watchWearsGlasses = form.watch("wears_glasses_or_lens");
    const watchHearing = form.watch("has_hearing_challenges");

    const watchBehavioural = form.watch("has_behavioural_challenges");
    const watchPhysical = form.watch("has_physical_challenges");
    const watchSpeech = form.watch("has_speech_challenges");
    const watchInjury = form.watch("history_of_accident_injury");
    const watchMedication = form.watch("regular_medication");
    const watchHealthIssue = form.watch("history_of_health_issues");
    const watchHospitalized = form.watch("surgery_hospitalization");
    const watchSpecialAttention = form.watch("special_attention");
    const watchAllergies = form.watch("has_allergies"); // Fixed typo
    const watchMaritalStatus = form.watch("marital_status");
    const watchParentsAreLocalGuardians = form.watch("parents_are_local_guardians");
    // Used for divorce section
    // const watchParentsAreGuardians = form.watch("parents_are_local_guardians"); // Used for guardian section
    // const watchWhoPaysTuition = form.watch("who_is_responsible_for_paying_applicants_tuition_fee"); // Fixed typo

    const { control, getValues, setValue, watch, trigger, getFieldState, formState } = form;
    const { errors, isValid: isOverallFormValid, isSubmitting } = formState;

    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
        control: form.control,
        name: "student_languages"
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
        name: "student_parent"
    });

    const { fields: guardianDetailFields, append: appendGuardianDetail, remove: removeGuardianDetail } = useFieldArray({
        control,
        name: "student_guardians"
    });

    const getContentTabSequence = () => {
        let sequence = TAB_ORDER.filter(t => t !== "instruction" && t !== "billing");
        if (watchAppliedFor !== 'Class XI') {
            sequence = sequence.filter(t => t !== "subjects");
        }
        return sequence;
    };

    const contentTabsInFlow = getContentTabSequence();
    const lastContentEntryTab = contentTabsInFlow.length > 0 ? contentTabsInFlow[contentTabsInFlow.length - 1] : "personal"; // Fallback if array is empty (should not happen with your TAB_ORDER)

    // ... (handleNextTab, handleBackTab, onSubmit - ensure onSubmit checks isOverallFormValid)

    // Helper function from lodash or implement your own (if not already present

    const handleNextTab = async () => {
        const currentTabIndexInOrder = TAB_ORDER.indexOf(currentTab);
        const fieldsForCurrentTab = TAB_FIELD_GROUPS[currentTab];

        let isCurrentTabContentValid = true;
        if (fieldsForCurrentTab && fieldsForCurrentTab.length > 0) {
            await trigger(fieldsForCurrentTab); // Validate only fields in the current tab
            // Check for errors specifically within the triggered fields
            isCurrentTabContentValid = !fieldsForCurrentTab.some(field => get(errors, field as string));
            // console.log(`Validation for tab ${currentTab}: ${isCurrentTabContentValid}`, errors);
        }

        if (isCurrentTabContentValid) {
            let nextTabKey: string | undefined = undefined;
            let nextTabIndex = currentTabIndexInOrder + 1;

            // Skip "subjects" if not Class XI
            if (TAB_ORDER[nextTabIndex] === "subjects" && watchAppliedFor !== 'Class XI') {
                nextTabIndex++;
            }

            if (nextTabIndex < TAB_ORDER.length) {
                nextTabKey = TAB_ORDER[nextTabIndex];
                setEnabledTabs(prev => new Set(prev).add(nextTabKey!));
                setCurrentTab(nextTabKey!);
                window.scrollTo(0, 0);
            }
        } else {
            console.log(`Validation failed for tab: ${currentTab}. Errors:`, errors);
            // Optionally focus the first error field
            const firstErrorField = fieldsForCurrentTab?.find(field => get(errors, field as string));
            if (firstErrorField) {
                try {
                    // Attempt to focus. This is best-effort as field might be complex.
                    (document.getElementsByName(firstErrorField as string)[0] as HTMLElement)?.focus();
                } catch (e) { console.warn("Could not focus error field:", e); }
            }
        }
    };

    const handleBackTab = () => {
        const currentTabIndexInOrder = TAB_ORDER.indexOf(currentTab);
        let prevTabIndex = currentTabIndexInOrder - 1;

        // Skip "subjects" if not Class XI when going back from "declaration" or "billing"
        if (TAB_ORDER[prevTabIndex] === "subjects" && watchAppliedFor !== 'Class XI') {
            prevTabIndex--;
        }

        if (prevTabIndex >= 0) {
            setCurrentTab(TAB_ORDER[prevTabIndex]);
            window.scrollTo(0, 0);
        }
    };


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
                school_name: '',
                school_board_affiliation: '', // Or a default from BOARD_AFFILIATION_OPTIONS
                school_from_year: undefined,
                school_to_year: undefined,
                school_from_class: '', // Or a default from CLASS_LEVEL_OPTIONS
                school_to_class: '',   // Or a default
                school_country: 'India', // Or empty
                school_zip_code: '',
                marksheet: undefined,
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
                relation: '', // Or a default like GUARDIAN_RELATION_OPTIONS[0]
                first_name: '',
                last_name: '',
                nationality: '',
                country_of_residence: '',
                contact_email: '',
                contact_phone: '',
                is_whatsapp_same: true,
                whatsapp_phone: '',
                is_address_same_as_applicant: '',
                address_country: '',
                address_zipcode: '',
                address_state: '',
                address_city: '',
                address_line1: '',
                address_line2: '',
                education: '', // Or a default
                field_of_study: '',
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
                        countryISO2,
                        watchCommZipcode,
                        // setCommStateOptions, // REMOVED
                        // setCommCityOptions, // REMOVED
                        setIsCommAddressLoading,
                        setCommAddressError,
                        "address_state",
                        "address_city",
                        setValue
                    );
                }, 800);
                return () => clearTimeout(timerId);
            } else {
                // setCommStateOptions([]); // No longer needed
                // setCommCityOptions([]); // No longer needed
                setCommAddressError("Invalid country selected or country code not found.");
                setValue("address_state", "" as any, { shouldValidate: false });
                setValue("address_city", "" as any, { shouldValidate: false });
            }
        } else {
            // setCommStateOptions([]); // No longer needed
            // setCommCityOptions([]); // No longer needed
            if (!watchCommZipcode && watchCommCountry) { // Only clear if zipcode is cleared but country remains
                setValue("address_state", "" as any, { shouldValidate: false });
                setValue("address_city", "" as any, { shouldValidate: false });
            }
            setCommAddressError(null); // Clear error if conditions not met
        }
    }, [watchCommCountry, watchCommZipcode, setValue, setIsCommAddressLoading, setCommAddressError]);

    useEffect(() => {
        // If billing country and zipcode are present and zipcode is of sufficient length
        if (watchBillingCountry && watchBillingZipcode && watchBillingZipcode.length >= 3) {
            const countryObj = countries.all.find(c => c.name === watchBillingCountry);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                const timerId = setTimeout(() => {
                    fetchAddressDetails(
                        countryISO2,
                        watchBillingZipcode,
                        // No state/city option setters needed
                        setIsBillAddressLoading,
                        setBillAddressError,
                        "billing_state",      // RHF field name for billing state
                        "billing_city",       // RHF field name for billing city
                        setValue              // RHF's setValue function
                    );
                }, 800);
                return () => clearTimeout(timerId);
            } else {
                setBillAddressError("Invalid billing country or country code not found.");
                setValue("billing_state", "" as any, { shouldValidate: false });
                setValue("billing_city", "" as any, { shouldValidate: false });
                setIsBillAddressLoading(false);
            }
        } else {
            // Clear form values if inputs are insufficient for a fetch
            if (!watchBillingZipcode && watchBillingCountry) {
                setValue("billing_state", "" as any, { shouldValidate: false });
                setValue("billing_city", "" as any, { shouldValidate: false });
            }
            setBillAddressError(null);
            setIsBillAddressLoading(false);
        }
    }, [
        watchBillingCountry,
        watchBillingZipcode,
        setValue,
        // setIsBillingAddressLoading, // Stable setters
        // setBillingAddressError      // Stable setters
    ]);
    // --- NEW: useEffect for Current School Address ---
    useEffect(() => {
        // If home-schooled, no need to fetch school address, clear any previous error/loading
        if (watchIsHomeSchooled === 'Yes') {
            // setCurrentSchoolStateOptions([]); // No longer needed
            // setCurrentSchoolCityOptions([]); // No longer needed
            setValue("current_school_state", "" as any, { shouldValidate: false }); // Clear form value
            setValue("current_school_city", "" as any, { shouldValidate: false });  // Clear form value
            setIsCurrentSchoolAddressLoading(false);
            setCurrentSchoolAddressError(null);
            return; // Exit early
        }

        // Proceed if not home-schooled
        if (watchCurrentSchoolCountry && watchCurrentSchoolZipcode && watchCurrentSchoolZipcode.length >= 3) {
            const countryObj = countries.all.find(c => c.name === watchCurrentSchoolCountry);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                const timerId = setTimeout(() => {
                    // Call the modified fetchAddressDetails
                    fetchAddressDetails(
                        countryISO2,
                        watchCurrentSchoolZipcode,
                        // setCurrentSchoolStateOptions, // REMOVED
                        // setCurrentSchoolCityOptions, // REMOVED
                        setIsCurrentSchoolAddressLoading,
                        setCurrentSchoolAddressError,
                        "current_school_state",     // RHF field name for state
                        "current_school_city",      // RHF field name for city
                        setValue                    // RHF's setValue function
                    );
                }, 800);
                return () => clearTimeout(timerId);
            } else {
                // setCurrentSchoolStateOptions([]); // No longer needed
                // setCurrentSchoolCityOptions([]); // No longer needed
                setCurrentSchoolAddressError("Invalid school country or country code not found.");
                setValue("current_school_state", "" as any, { shouldValidate: false });
                setValue("current_school_city", "" as any, { shouldValidate: false });
                setIsCurrentSchoolAddressLoading(false); // Ensure loading is reset
            }
        } else {
            // setCurrentSchoolStateOptions([]); // No longer needed
            // setCurrentSchoolCityOptions([]); // No longer needed
            // Clear form values if inputs are insufficient for a fetch, e.g., zipcode cleared
            if (!watchCurrentSchoolZipcode && watchCurrentSchoolCountry) {
                setValue("current_school_state", "" as any, { shouldValidate: false });
                setValue("current_school_city", "" as any, { shouldValidate: false });
            }
            setCurrentSchoolAddressError(null); // Clear error if conditions for fetch aren't met
            setIsCurrentSchoolAddressLoading(false); // Ensure loading is reset
        }
    }, [
        watchIsHomeSchooled,
        watchCurrentSchoolCountry,
        watchCurrentSchoolZipcode,
        setValue,
        // setIsCurrentSchoolAddressLoading, // Stable setters don't strictly need to be deps
        // setCurrentSchoolAddressError      // but good for explicitness if ESLint complains
    ]);
    // 3. Define submit handler (remains the same conceptually)
    const onSubmit: SubmitHandler<AdmissionRegistrationFormDataYup> = async (values) => {
        // Check for errors (keep this part)
        console.log("Form validation errors at submit:", errors);
        console.log("Attempting final submission. Overall form valid:", isOverallFormValid);
        console.log("Current errors:", errors);

        // Final check for overall validity. Tab-by-tab should catch most things.
        if (!isOverallFormValid) {
            alert("Please ensure all sections of the form are correctly filled out and valid before submitting.");
            // Try to find the first tab with an error and navigate to it
            for (const tabKey of TAB_ORDER) {
                if (tabKey === "instruction") continue;
                const fieldsInTab = TAB_FIELD_GROUPS[tabKey];
                if (tabKey === "subjects" && watchAppliedFor !== 'Class XI') continue; // Skip subjects if not applicable

                if (fieldsInTab && fieldsInTab.some(field => get(errors, field as string))) {
                    setCurrentTab(tabKey);
                    // Attempt to focus first error in that tab
                    const firstErrorField = fieldsInTab.find(field => get(errors, field as string));
                    if (firstErrorField) {
                        try {
                            (document.getElementsByName(firstErrorField as string)[0] as HTMLElement)?.focus();
                        } catch (e) { console.warn("Could not focus error field on submit:", e); }
                    }
                    return; // Stop submission
                }
            }
            // If no specific field error found but form is invalid (e.g. schema-level test fail)
            if (Object.keys(errors).length === 0) {
                alert("There's an issue with the form data. Please review all sections.");
            }
            return;
        }

        console.log("Yup Validated Form Values for Submission:", values);

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
                if (key === 'recent_photo' || key === 'birth_certificate' || key === 'id_proof_document' || key === 'vaccine_certificates' || key === 'medical_prescription' || key === 'court_order_document' || key === 'legal_rights_document') {
                    if (value instanceof File) {
                        // Store filename separately if needed by backend
                        payload[`${key}_filename`] = value.name;
                        payload[key] = await fileToBase64(value); // Assign base64 string
                    } else {
                        payload[key] = null; // Or handle cases where file might be optional/cleared
                    }
                }
                // Handle arrays (tables) - keep them as arrays for JSON
                else if (key === 'optional_language_table' || key === 'previous_schools' || key === 'information' || key === 'payment_program_links') {
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
                                {fieldName === "application_academic_year" ? (
                                    <Input
                                        value={field.value ?? ''}
                                        disabled
                                        className="bg-muted cursor-not-allowed"
                                    />
                                ) : fieldName === "application_for" ? (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ''}
                                        onOpenChange={(isOpen) => {
                                            if (!isOpen) {
                                                field.onBlur(); // Crucial for isTouched
                                                if (form.getFieldState("application_for").isTouched) {
                                                    form.trigger("application_for");
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
    const [tab, setTab] = useState(TAB_ORDER[0]);
    const currentTabIndexGlobal = TAB_ORDER.indexOf(currentTab);


    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [tab]);

    console.log("form state errors", form.formState.errors, form.formState.isValid, watch());
    return (
        <Form {...form}>
            <Tabs value={currentTab}
                onValueChange={(newTab) => {
                    // Allow navigation only to enabled tabs OR if going backwards
                    const newTabIndex = TAB_ORDER.indexOf(newTab);
                    const currentContentIndex = TAB_ORDER.indexOf(currentTab);
                    if (enabledTabs.has(newTab) || newTabIndex < currentContentIndex) {
                        setCurrentTab(newTab);
                    }
                }}
                className="w-full">
                <TabsList className="w-full flex flex-wrap justify-between mb-4 overflow-x-auto">
                    <TabsTrigger value="instruction" className="flex-1 min-w-[120px]">Instructions</TabsTrigger>
                    <TabsTrigger value="personal" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("personal")}>Personal</TabsTrigger>
                    <TabsTrigger value="academic" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("academic")}>Academic</TabsTrigger>
                    <TabsTrigger value="health" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("health")}>Health</TabsTrigger>
                    <TabsTrigger value="parents" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("parents")}>Parents</TabsTrigger>
                    {watchAppliedFor === 'Class XI' &&
                        <TabsTrigger value="subjects" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("subjects")}>Preferences</TabsTrigger>
                    }
                    <TabsTrigger value="declaration" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("declaration")}>Declaration</TabsTrigger>
                    <TabsTrigger value="billing" className="flex-1 min-w-[120px]" disabled={!enabledTabs.has("billing")}>Payment</TabsTrigger>
                </TabsList>
                <p className='text-center text-base font-medium'>IHS-202526-001</p>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <TabsContent value="instruction">
                        <section className="space-y-6">
                            <AdmissionProcedure onAgree={() => {
                                setEnabledTabs(prev => new Set(prev).add("personal")); // Should already be enabled
                                setCurrentTab("personal");
                            }} />
                        </section>
                    </TabsContent>
                    <TabsContent value="personal">
                        {/* === Section: Initial Details === */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-semibold border-b pb-2">Application & Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4"> {/* Reduced gap-y */}
                                {/* Application Details */}
                                {renderField("application_academic_year", { label: "Application Academic Year", fieldtype: "Link", options: "IHS Academic Year", reqd: 1 })}
                                {renderField("application_for", { label: "Application For", fieldtype: "Select", options: "Class II\nClass V\nClass VIII\nClass XI", reqd: 1 })}

                                {/* Previous Application */}
                                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                                    <h3 className="font-medium text-md mb-3">Previous Application</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("applied_to_ihs_before", { label: "Have you applied to Isha Home School before?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                        {watchAppliedBefore === 'Yes' && (
                                            <FormField
                                                //@ts-expect-error -- ignore type error for now, as react-hook-form types may not match AdmissionRegistrationFormDataYup exactly
                                                control={form.control}
                                                name="previous_applied_year"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>Previous Application Year<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onOpenChange={(isOpen) => {
                                                                    if (!isOpen) {
                                                                        field.onBlur();
                                                                        if (getFieldState('previous_applied_year').isTouched) {
                                                                            trigger('previous_applied_year');
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
                                                name="previous_applied_for"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>Previously Applied For Grade<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onOpenChange={(isOpen) => {
                                                                    if (!isOpen) {
                                                                        field.onBlur();
                                                                        if (getFieldState('previous_applied_for').isTouched) {
                                                                            trigger('previous_applied_for');
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
                                        {watchAppliedBefore === 'Yes' && renderField("previous_applied_comments", { label: "Previous Application Comments", fieldtype: "Data", reqd: 1 })}
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
                                        {renderField("country_of_birth", {
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
                                            name="address_country"
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
                                                                setValue("address_zip_code", "");
                                                                setValue("address_state", "");
                                                                setValue("address_city", "");
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
                                            name="address_zip_code" // Assuming this is your zipcode field
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>PIN / ZIP Code<span className="text-destructive"> *</span></FormLabel>
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
                                            control={form.control} // Assuming 'form' is your useForm() result
                                            name="address_state"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="State (auto-filled)"
                                                            {...field}
                                                            value={field.value ?? ''} // Ensure value is controlled
                                                            disabled // Make the input disabled
                                                            className="bg-muted cursor-not-allowed" // Optional: Style for disabled state
                                                        />
                                                    </FormControl>
                                                    {isCommAddressLoading && !field.value && <FormDescription>Loading state...</FormDescription>}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* City Text Input (Enabled) */}
                                        <FormField
                                            control={form.control}
                                            name="address_city"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col space-y-1.5">
                                                    <FormLabel>City/ Town<span className="text-destructive"> *</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter city/town"
                                                            {...field}
                                                            value={field.value ?? ''} // Ensure value is controlled
                                                            disabled={isCommAddressLoading && !field.value} // Optionally disable while loading if it's empty
                                                        />
                                                    </FormControl>
                                                    {isCommAddressLoading && !field.value && <FormDescription>Loading city...</FormDescription>}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {renderField("address_line_1", { label: "Address Line 1", fieldtype: "Data", reqd: 1 })}
                                        {renderField("address_line_2", { label: "Address Line 2", fieldtype: "Data" })}
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
                                        {renderField("recent_photo", { label: "Recent Photograph", fieldtype: "Attach", reqd: 1 })}
                                        {renderField("birth_certificate", { label: "Birth Certificate", fieldtype: "Attach", reqd: 1 })}
                                        {renderField("id_proof_type", { label: "ID Proof Type", fieldtype: "Select", options: "\nAadhaar Card\nPassport", reqd: 1 })}
                                        {renderField("id_proof_document", { label: "ID Proof Document", fieldtype: "Attach", reqd: 1 })}
                                        {/* Conditional ID Fields */}
                                        {watchIdProof === 'Aadhaar Card' && renderField("aadhaar_number", { label: "Aadhaar Number", fieldtype: "Data", mandatory_depends_on: "Aadhaar Card", reqd: 1 })}
                                        {watchIdProof === 'Passport' && renderField("passport_number", { label: "Passport Number", fieldtype: "Data", mandatory_depends_on: "Passport", reqd: 1 })}
                                        {watchIdProof === 'Passport' && renderField("passport_place_of_issue", { label: "Passport Place of Issue", fieldtype: "Data", mandatory_depends_on: "Passport", reqd: 1 })}
                                        {watchIdProof === 'Passport' && renderField("passport_date_of_issue", { label: "Passport Date of Issue", fieldtype: "Date", mandatory_depends_on: "Passport", reqd: 1 })}
                                        {watchIdProof === 'Passport' && renderField("passport_date_of_expiry", { label: "Passport Date of Expiry", fieldtype: "Date", mandatory_depends_on: "Passport", reqd: 1 })}
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
                                            {watchCurrentSchoolBoardAffiliation === 'Other' && (
                                                <FormField
                                                    control={form.control}
                                                    name="current_school_other_board_affiliation"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col space-y-1.5">
                                                            <FormLabel>Specify Other Board<span className="text-destructive"> *</span></FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter board name" {...field} value={field.value ?? ''} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            {/* {renderField("board_affiliation_data2", { label: "Board Affiliation", fieldtype: "Data", mandatory_depends_on: "No" })} Assuming data2 is correct */}
                                            {renderField("current_school_phone_number", { label: "School Phone Number", fieldtype: "PhoneInput", reqd: watchIsHomeSchooled === 'No' ? 1 : 0, placeholder: "Enter school phone" })}
                                            {renderField("current_school_email_address", { label: "School Email Address", fieldtype: "Data", options: "Email", mandatory_depends_on: "No", reqd: 1 })}
                                            {/* {renderField("current_school_country", { label: "School Country", fieldtype: "Link", options: "Country", mandatory_depends_on: "No" })} */}
                                            {/* {renderField("current_school_zip_code", { label: "School PIN / ZIP Code", fieldtype: "Data" })} */}
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
                                                                    form.setValue("current_school_zip_code", "");
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
                                                name="current_school_zip_code"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School PIN / ZIP Code<span className="text-destructive"> *</span></FormLabel>
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
                                                control={form.control}
                                                name="current_school_state"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School State<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="State (auto-filled)"
                                                                {...field}
                                                                value={field.value ?? ''} // Ensure value is controlled
                                                                disabled // Make the input disabled
                                                                className="bg-muted cursor-not-allowed" // Optional: Style for disabled state
                                                            />
                                                        </FormControl>
                                                        {isCurrentSchoolAddressLoading && !field.value && <FormDescription>Loading state...</FormDescription>}
                                                        {/* Display API error if present and no RHF error, otherwise RHF's FormMessage */}
                                                        {currentSchoolAddressError && !form.formState.errors.current_school_state && (
                                                            <p className="text-sm font-medium text-destructive">{currentSchoolAddressError}</p>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Current School City (Enabled Text Input) */}
                                            <FormField
                                                control={form.control}
                                                name="current_school_city"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-1.5">
                                                        <FormLabel>School City/ Town<span className="text-destructive"> *</span></FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter city/town"
                                                                {...field}
                                                                value={field.value ?? ''} // Ensure value is controlled
                                                                disabled={isCurrentSchoolAddressLoading && !field.value} // Optionally disable while loading if it's empty
                                                            />
                                                        </FormControl>
                                                        {isCurrentSchoolAddressLoading && !field.value && <FormDescription>Loading city...</FormDescription>}
                                                        {currentSchoolAddressError && !form.formState.errors.current_school_city && (
                                                            <p className="text-sm font-medium text-destructive">{currentSchoolAddressError}</p>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {renderField("current_school_address_line1", { label: "School Address Line 1", fieldtype: "Data", mandatory_depends_on: "No", reqd: 1 })}
                                            {renderField("current_school_address_line2", { label: "School Address Line 2", fieldtype: "Data" })}
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
                                        {renderField("hobbies_interests_and_extra_curricular", { label: "Hobbies, Interests & Extra-Curricular Activities", fieldtype: "Small Text", reqd: 1 })}
                                        {renderField("learning_disability", { label: "Special Learning Needs or Disability", fieldtype: "Small Text", reqd: 1 })}
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
                                    {/* {watchAppliedFor === 'Class II' && renderField("toilet_trained", { label: "Is Applicant toilet-trained?", fieldtype: "Select", options: "\nYes\nNo", mandatory_depends_on: "Class II" })} */}
                                    {/* {watchAppliedFor === 'Class II' && renderField("bed_wet", { label: "Does Applicant bed-wet?", fieldtype: "Select", options: "\nYes\nNo", mandatory_depends_on: "Class II" })} */}
                                </div>

                                {/* Hygiene & Sleep Habits */}
                                {watchAppliedFor === 'Class II' && <><h3 className="font-medium text-md pt-4 border-t mt-4">Hygiene & Sleep Habits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                        {renderField("toilet_trained", { label: "Is the Applicant Toilet trained?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                        {renderField("bed_wet", { label: "Does the Applicant wet Bed?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
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
                                    {renderField("history_of_accident_injury", { label: "Does the applicant have history of any accident/ injury?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchInjury === 'Yes' && renderField("history_of_accident_injury_details", { label: "Accident/ Injury Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("regular_medication", { label: "Is the Applicant on regular medication? (Including Ayurvedic, Siddha, Homeopathic and Alternative Medicines)", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchMedication === 'Yes' && renderField("regular_medication_details", { label: "Regular Medication Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {watchMedication === 'Yes' && renderField("medical_prescription", { label: "Medical Prescription", fieldtype: "Attach", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("history_of_health_issues", { label: "Does the applicant have History of any health Issue?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchHealthIssue === 'Yes' && renderField("history_of_health_issues_details", { label: "Health Issue Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("surgery_hospitalization", { label: "Does the applicant have history of any hospitalization and/ or surgery?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchHospitalized === 'Yes' && renderField("surgery_hospitalization_details", { label: "Hospitalization/ Surgery Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("special_attention", { label: "Does the applicant have any other health issue that needs special attention?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchSpecialAttention === 'Yes' && renderField("special_attention_details", { label: "Special Attention Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
                                    {renderField("has_allergies", { label: "Does the applicant have any food/ drug allergies?", fieldtype: "Select", options: "\nYes\nNo", reqd: 1 })}
                                    {watchAllergies === 'Yes' && renderField("allergies_details", { label: "Allergy Details", fieldtype: "Small Text", mandatory_depends_on: "Yes", reqd: 1 })}
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
                                                first_name: '',
                                                last_name: '',
                                                relation: parentFields.length === 0 ? PARENT_RELATION_OPTIONS_YUP[0] : PARENT_RELATION_OPTIONS_YUP[1], // Suggests 'Father' then 'Mother'
                                                nationality: undefined, // For CountryDropdown to show placeholder
                                                country_of_residence: undefined, // For CountryDropdown
                                                contact_email: '',
                                                contact_phone: '', // PhoneInput usually handles empty string well
                                                is_whatsapp_same: true, // Default boolean
                                                whatsapp_phone: '',    // Will be shown/required based on is_whatsapp_same
                                                is_address_same_as_applicant: undefined, // For Select to show placeholder
                                                // Address fields are optional in Yup schema if is_address_same_as_applicant is 'Yes'
                                                // They will become required via .when() if it's 'No'.
                                                // So, their default can be undefined.
                                                address_country: undefined,
                                                address_zipcode: '', // Or undefined
                                                address_state: undefined,
                                                address_city: undefined,
                                                address_line1: '', // Or undefined
                                                address_line2: '', // Or undefined
                                                education: undefined, // For Select to show placeholder
                                                field_of_study: '',
                                                profession: undefined, // For Select to show placeholder
                                                organization_name: '',
                                                designation: '',
                                                annual_income: '',
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
                                    {renderField("marital_status", { label: "Parent Marital Status", fieldtype: "Select", options: "\nMarried\nSeparated\nDivorced\nSingle Parent", reqd: 1 })}
                                    {/* Conditional Divorce Fields */}
                                    {watchMaritalStatus === 'Divorced' && renderField("who_is_responsible_for_paying_applicants_tuition_fee", { label: "Who is resposible for paying applicant's tuition fee?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced", reqd: 1 })} {/* Fixed typo */}
                                    {watchMaritalStatus === 'Divorced' && renderField("court_order_document", { label: "Court Order Document", fieldtype: "Attach", mandatory_depends_on: "Divorced", reqd: 1 })}
                                    {watchMaritalStatus === 'Divorced' && renderField("who_is_allowed_to_receive_communication", { label: "Who is allowed to receive school communication?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced", reqd: 1 })}
                                    {watchMaritalStatus === 'Divorced' && renderField("who_is_allowed_to_receive_report_cards", { label: "Who is allowed to receive report cards?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced", reqd: 1 })}
                                    {watchMaritalStatus === 'Divorced' && renderField("who_is_allowed_to_visit_school", { label: "Who is allowed to visit child?", fieldtype: "Select", options: "\nFather\nMother\nBoth", mandatory_depends_on: "Divorced", reqd: 1 })}
                                    {watchMaritalStatus === 'Divorced' && renderField("legal_rights_document", { label: "Legal Rights Document", fieldtype: "Attach", mandatory_depends_on: "Divorced", reqd: 1 })}
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
                                                    relation: '', // Or a default like GUARDIAN_RELATION_OPTIONS[0]
                                                    first_name: '',
                                                    last_name: '',
                                                    nationality: '',
                                                    country_of_residence: '',
                                                    contact_email: '',
                                                    contact_phone: '',
                                                    is_whatsapp_same: true,
                                                    whatsapp_phone: '',
                                                    is_address_same_as_applicant: '',
                                                    address_country: '',
                                                    address_zipcode: '',
                                                    address_state: '',
                                                    address_city: '',
                                                    address_line1: '',
                                                    address_line2: '',
                                                    education: '', // Or a default
                                                    field_of_study: '',
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
                                        {renderField("response_why_ihs_post_10th", { placeholder: "", label: "Why are you opting to enroll in the IHS Post-10 Program? What do you hope to gain in a 3 year program here, as opposed to regular 2 year program elsewhere?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 2</h4>
                                        {renderField("response_subject_combination", { placeholder: "", label: "Can you talk us through the reasons behind the subject combination you have chosen? What do you see yourself doing in the future?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 3</h4>
                                        {renderField("response_activity_love_to_do_most", { placeholder: "", label: "What activity do you love doing the most? Why? It could be singing in the shower, talking on the telephone, exploring the further reaches of YouTube, anything (We are more interested in the why).", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 4</h4>
                                        {renderField("response_change_one_thing_about_world", { placeholder: "", label: "If you could change one thing about the world, what would it be, and why?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 5</h4>
                                        {renderField("response_change_one_thing_about_yourself", { placeholder: "", label: "If you could change one thing about yourself, what would it be, and why?", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 6</h4>
                                        {renderField("response_dream_vacation", { placeholder: "", label: "Describe your dream vacation.", fieldtype: "Small Text", reqd: 1 })}

                                        <h4 className="font-semibold">Question 7</h4>
                                        {renderField("response_additional_comments_optional", { placeholder: "", label: "Is there anything else want to share with us but couldn’t write anywhere else? This is the place, but please don’t feel like you have to write something here. This question is optional.", fieldtype: "Small Text", reqd: 1 })}
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
                                        {renderField("parents_response_why_ihs_post_10th", { placeholder: "", label: "Please discuss your primary reason for considering the Isha Home School’s Post-10 Program for your child. What do you hope your child will gain in a 3 year program here, as opposed to regular 2 year program elsewhere? What are your expectations for your child's schooling experience (please also mention a few areas outside of academics)?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 2</h4>
                                        {renderField("parents_response_childs_self_confidence", { placeholder: "", label: "From what activities does your child derive self-confidence?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 3</h4>
                                        {renderField("parents_response_strengths_weaknesses", { placeholder: "", label: "What are your child’s strengths and weaknesses? (Please comment on social characteristics: e.g., self-reliance, sense of humour, ability to mix, shyness, assertiveness, etc.)", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 4</h4>
                                        {renderField("parents_response_child_future_education_plan", { placeholder: "", label: "What are your thoughts about your child’s future educational and/or professional aspirations? Have you and your child charted out a particular trajectory or course? Is there a particular course that you would like your child to pursue? If so, why?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 5</h4>
                                        {renderField("parents_response_on_childs_concerns", { placeholder: "", label: "Discuss any particular concerns of which the school should be aware: e.g., Has your child experienced any difficult challenges or personal setbacks in recent years? Are there any medical conditions of which we should be aware? Does your child's health limit or interfere with the normal performance of everyday activities, including class work, athletics, or other duties?", fieldtype: "Small Text", reqd: 1 })}
                                        <h4 className="font-semibold">Question 6</h4>
                                        {renderField("parents_response_additional_comments", { placeholder: "", label: "Please make any additional comments about your child which you feel may be helpful to us.", fieldtype: "Small Text", reqd: 1 })}
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
                                {renderField("declaration_date", { label: "Date", fieldtype: "Date", reqd: 1 })}
                                {renderField("declaration_place", { label: "Place", fieldtype: "Data", reqd: 1 })}
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
                                    {renderField("billing_first_name", { label: "First Name", fieldtype: "Data", reqd: 1 })}
                                    {renderField("billing_last_name", { label: "Last Name", fieldtype: "Data", reqd: 1 })}
                                    {renderField("billing_mobile", { label: "Mobile", fieldtype: "PhoneInput", reqd: 1, placeholder: "Enter billing phone" })}
                                    {renderField("billing_email", { label: "Email", fieldtype: "Data", options: "Email", reqd: 1 })}
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
                                                            setValue("billing_zip_code", "");
                                                            setValue("billing_state", "");
                                                            setValue("billing_city", "");
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
                                        name="billing_zip_code"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>PIN / ZIP Code<span className="text-destructive"> *</span></FormLabel>
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
                                        control={control}
                                        name="billing_state"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="State (auto-filled)"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        disabled
                                                        className="bg-muted cursor-not-allowed"
                                                    />
                                                </FormControl>
                                                {isBillAddressLoading && !field.value && <FormDescription>Loading state...</FormDescription>}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* City Dropdown */}
                                    <FormField
                                        control={control}
                                        name="billing_city"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-1.5">
                                                <FormLabel>City/ Town<span className="text-destructive"> *</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter city/town"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        disabled={isBillAddressLoading && !field.value}
                                                    />
                                                </FormControl>
                                                {isBillAddressLoading && !field.value && <FormDescription>Loading city...</FormDescription>}
                                                {/* Display API error if present, otherwise RHF's FormMessage */}
                                                {billAddressError && <FormMessage className="text-destructive">{billAddressError}</FormMessage>}
                                                {!billAddressError && <FormMessage />}
                                            </FormItem>
                                        )}
                                    />
                                    {renderField("billing_address_line_1", { label: "Address Line 1", fieldtype: "Data", reqd: 1 })}
                                    {renderField("billing_address_line_2", { label: "Address Line 2", fieldtype: "Data" })}
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
                    {currentTab === "billing" && (
                        <div className="hidden"> {/* Hidden but part of the form */}
                            <Button type="submit" data-testid="hidden-submit">Submit</Button>
                        </div>
                    )}
                </form>
                {/* Navigation Buttons OUTSIDE the form to prevent accidental submit */}
                {currentTab !== "instruction" && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 mt-8 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackTab}
                            disabled={currentTab === TAB_ORDER[1]} // Disable if on "personal"
                        >
                            Back
                        </Button>

                        {/* Show "Next" button if current tab is NOT "billing" */}
                        {currentTab !== "billing" && (
                            <Button type="button" onClick={handleNextTab}>
                                Next
                            </Button>
                        )}

                        {/* Show "Submit And Pay" button ONLY on the "billing" tab */}
                        {currentTab === "billing" && (
                            <Button
                                type="submit" // Will programmatically submit the form
                                // Use RHF's handleSubmit
                                size="lg"
                                disabled={isSubmitting || !isOverallFormValid} // Optional: disable if whole form isn't valid yet
                            >
                                {isSubmitting ? "Submitting..." : "Submit And Pay"}
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