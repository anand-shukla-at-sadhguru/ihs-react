// // Update the path below to the correct relative location of admissionRegistrationSchema.ts
// import {
//     type AdmissionRegistrationFormData,
//     // type IndividualLanguageData
// } from './admissionRegistrationSchema';
// // (Keep TAB_KEYS, TAB_FIELD_MAPPINGS, navigateToNextTab from previous work if they are in this file)

// type DependentFieldGetter = (values: AdmissionRegistrationFormData) => (keyof AdmissionRegistrationFormData)[];

export const LANGUAGE_OPTIONS = ['English', 'Tamil', 'Hindi', 'French', 'German', 'Spanish', 'Arabic', 'Mandarin', 'Japanese', 'Other'] as const;
export const PROFICIENCY_OPTIONS = ['Native', 'Advanced', 'Intermediate', 'Basic'] as const;

// export const FIELD_DEPENDENCIES: Partial<Record<keyof AdmissionRegistrationFormData, (keyof AdmissionRegistrationFormData | DependentFieldGetter)[]>> = {
//     gender: [
//         (values) => (values.gender === 'Other' ? ['other_gender'] : ['other_gender']) // Always trigger other_gender to clear errors if gender changes
//     ],
//     religion: [
//         (values) => (values.religion === 'Other' ? ['other_religion'] : ['other_religion'])
//     ],
//     community: [
//         (values) => (values.community === 'Other' ? ['other_community'] : ['other_community'])
//     ],
//     applied_to_ihs_before: [
//         (values) => {
//             const deps: (keyof AdmissionRegistrationFormData)[] = ['previous_application_application_year', 'previous_application_applied_for', 'previous_application_remarks'];
//             // No need to conditionally return empty array; superRefine handles requirement.
//             // We always trigger these so errors can be cleared if applied_to_ihs_before changes to 'No'.
//             return deps;
//         }
//     ],
//     id_proof: [
//         (values) => {
//             const deps: (keyof AdmissionRegistrationFormData)[] = ['aadhaar_number', 'passport_number', 'place_of_issue', 'date_of_issue', 'date_of_expiry'];
//             return deps; // Trigger all potential dependents, superRefine will sort out requirements
//         }
//     ],
//     is_home_schooled: [
//         (values) => {
//             const deps: (keyof AdmissionRegistrationFormData)[] = [
//                 'current_school_name', 'current_school_board_affiliation',
//                 'current_school_phone_number', 'current_school_country',
//                 'current_school_area_code', 'current_school_city', 'current_school_state',
//                 'current_school_email_address', 'current_school_a_line1', 'current_school_a_line2',
//                 'was_the_applicant_ever_home_schooled'
//             ];
//             return deps;
//         }
//     ],
//     wears_glasses_or_lens: [
//         (values) => (values.wears_glasses_or_lens === 'Yes' ? ['right_eye_power', 'left_eye_power'] : ['right_eye_power', 'left_eye_power'])
//     ],
//     applied_for: [ // This field controls many sections
//         (values) => {
//             let deps: (keyof AdmissionRegistrationFormData)[] = [];
//             // Class II hygiene
//             deps.push('is_toilet_trained', 'wets_bed', 'bed_wet_frequency');
//             // Class XI subjects
//             deps.push('group_a', 'group_b', 'group_c', 'group_d');
//             // Add any other fields directly dependent on applied_for for their *requirement* logic in superRefine
//             return deps;
//         }
//     ],
//     wets_bed: [
//         (values) => (values.applied_for === 'Class II' && values.wets_bed === 'Yes' ? ['bed_wet_frequency'] : ['bed_wet_frequency'])
//     ],
//     has_hearing_challenges: [(values) => (values.has_hearing_challenges === 'Yes' ? ['hearing_challenges'] : ['hearing_challenges'])],
//     has_behavioural_challenges: [(values) => (values.has_behavioural_challenges === 'Yes' ? ['behavioural_challenges'] : ['behavioural_challenges'])],
//     has_physical_challenges: [(values) => (values.has_physical_challenges === 'Yes' ? ['physical_challenges'] : ['physical_challenges'])],
//     has_speech_challenges: [(values) => (values.has_speech_challenges === 'Yes' ? ['speech_challenges'] : ['speech_challenges'])],
//     has_injury: [(values) => (values.has_injury === 'Yes' ? ['injury_details'] : ['injury_details'])],
//     on_medication: [
//         (values) => (values.on_medication === 'Yes' ? ['medication_details', 'medical_prescription'] : ['medication_details', 'medical_prescription'])
//     ],
//     has_health_issue: [(values) => (values.has_health_issue === 'Yes' ? ['health_issue_details'] : ['health_issue_details'])],
//     was_hospitalized: [(values) => (values.was_hospitalized === 'Yes' ? ['hospitalization_details'] : ['hospitalization_details'])],
//     needs_special_attention: [(values) => (values.needs_special_attention === 'Yes' ? ['attention_details'] : ['attention_details'])],
//     has_allergies: [(values) => (values.has_allergies === 'Yes' ? ['allergy_details'] : ['allergy_details'])],
//     parent_marital_status: [
//         (values) => {
//             const deps: (keyof AdmissionRegistrationFormData)[] = [
//                 'who_is_responsible_for_paying_applicants_tuition_fee', 'court_order_document',
//                 'who_is_allowed_to_receive_school_communication', 'legal_rights_document',
//                 'who_is_allowed_to_receive_report_cards', 'visit_rights'
//             ];
//             return deps;
//         }
//     ],
//     parents_are_local_guardians: [
//         (values) => (values.parents_are_local_guardians === 'No' ? ['student_guardians'] : ['student_guardians']) // Validate the array itself
//     ],
//     tnc_check: [ // If tnc_check influences date/place requirement in superRefine
//         (values) => (values.tnc_check ? ['date', 'place'] : ['date', 'place'])
//     ]
// };