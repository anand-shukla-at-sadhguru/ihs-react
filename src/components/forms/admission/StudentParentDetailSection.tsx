// src/components/forms/admission/StudentParentDetailSection.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Control, useFormContext, UseFormSetValue, UseFormGetValues, Path } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { PhoneInput } from "@/components/ui/phone-input";
import type { AdmissionRegistrationFormData } from './admissionRegistrationSchema';
import type { Country } from './AdmissionRegistrationForm';
import { countries } from "country-data-list";

const PARENT_RELATION_OPTIONS = ['Father', 'Mother'] as const;
const PARENT_EDUCATION_LEVEL_OPTIONS_STRING = "Class VIII or below\nSSLC/ PUC\nHigher Secondary\nGraduate\nPost-Graduate\nM. Phil\nPhD\nPost-Doctoral";
const PARENT_EDUCATION_LEVEL_OPTIONS = PARENT_EDUCATION_LEVEL_OPTIONS_STRING.split('\n').map(o => o.trim()).filter(Boolean);
const PARENT_PROFESSION_OPTIONS_STRING = "Academia-Professors, Research Scholars, Scientists\nArts, Music, Entertainment\nArchitecture and Construction\nAgriculture\nArmed Forces\nBanking and Finance and Financial Services\nBusinessman/ Entrepreneur\nEducation and Training\nInformation Technology\nHealthcare\nOthers";
const PARENT_PROFESSION_OPTIONS = PARENT_PROFESSION_OPTIONS_STRING.split('\n').map(o => o.trim()).filter(Boolean);

interface StudentParentDetailSectionProps {
    control: Control<AdmissionRegistrationFormData>;
    index: number;
    removeParent: (index: number) => void;
    totalParents: number;
    getValues: UseFormGetValues<AdmissionRegistrationFormData>;
    setValue: UseFormSetValue<AdmissionRegistrationFormData>;
}

export const StudentParentDetailSection: React.FC<StudentParentDetailSectionProps> = ({
    control,
    index,
    removeParent,
    totalParents,
    getValues,
    setValue,
}) => {
    const { watch, trigger } = useFormContext<AdmissionRegistrationFormData>();
    const pathPrefix = `students_parents.${index}` as const;

    const watchIsWhatsappSame = watch(`${pathPrefix}.parent_is_whatsapp_same`);
    const watchIsAddressSame = watch(`${pathPrefix}.parent_is_address_same_as_applicant`);
    const parentAddressCountryName = watch(`${pathPrefix}.parent_address_country`);
    const parentAddressZipcode = watch(`${pathPrefix}.parent_address_zipcode`);

    const [parentAddrStateOptions, setParentAddrStateOptions] = useState<string[]>([]);
    const [parentAddrCityOptions, setParentAddrCityOptions] = useState<string[]>([]);
    const [isParentAddrLoading, setIsParentAddrLoading] = useState(false);
    const [parentAddrError, setParentAddrError] = useState<string | null>(null);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Ref to track if a fetch is currently active for the *specific inputs*
    const activeFetchIdentifier = useRef<string | null>(null);

    const fetchParentAddressDetails = useCallback(async (countryISO2: string, zipcode: string) => {
        const currentFetchId = `${countryISO2}-${zipcode}`;
        activeFetchIdentifier.current = currentFetchId; // Mark this fetch as active
        setIsParentAddrLoading(true);
        setParentAddrError(null);

        const apiUrl = `https://cdi-gateway.isha.in/contactinfovalidation/api/countries/${countryISO2}/pincodes/${zipcode}`;
        const rhfStateField = `${pathPrefix}.parent_address_state` as keyof AdmissionRegistrationFormData;
        const rhfCityField = `${pathPrefix}.parent_address_city` as keyof AdmissionRegistrationFormData;

        try {
            const response = await fetch(apiUrl);
            // Only process if this is still the active fetch request
            if (activeFetchIdentifier.current !== currentFetchId) {
                return; // A newer fetch has been initiated, ignore this response
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Pincode ${zipcode} not found or API error: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.state && data.acceptedCities && Array.isArray(data.acceptedCities)) {
                const stateArray = [data.state];
                const citiesArray = data.acceptedCities;
                setParentAddrStateOptions(stateArray);
                setParentAddrCityOptions(citiesArray);
                setValue(rhfStateField, stateArray[0] || "", { shouldValidate: true });
                const cityToSet = data.defaultcity && citiesArray.includes(data.defaultcity) ? data.defaultcity : (citiesArray[0] || "");
                setValue(rhfCityField, cityToSet, { shouldValidate: true });
                trigger([rhfStateField, rhfCityField]);
            } else {
                setParentAddrStateOptions([]); setParentAddrCityOptions([]);
                setValue(rhfStateField, "", { shouldValidate: true }); setValue(rhfCityField, "", { shouldValidate: true });
                setParentAddrError("Invalid data structure from address API.");
                trigger([rhfStateField, rhfCityField]);
            }
        } catch (error: any) {
            if (activeFetchIdentifier.current === currentFetchId) { // Only set error if this is still the relevant fetch
                setParentAddrStateOptions([]); setParentAddrCityOptions([]);
                setValue(rhfStateField, "", { shouldValidate: true }); setValue(rhfCityField, "", { shouldValidate: true });
                setParentAddrError(error.message || "Failed to fetch address details.");
                trigger([rhfStateField, rhfCityField]);
            }
        } finally {
            if (activeFetchIdentifier.current === currentFetchId) { // Only clear loading if this is the active fetch
                setIsParentAddrLoading(false);
                activeFetchIdentifier.current = null; // Clear active fetch
            }
        }
    }, [setValue, pathPrefix, trigger]); // `setIsParentAddrLoading`, `setParentAddrError`, `setParentAddrStateOptions`, `setParentAddrCityOptions` are stable setters

    useEffect(() => {
        const fieldsToTrigger: Path<AdmissionRegistrationFormData>[] = [
            `${pathPrefix}.parent_address_country`,
            `${pathPrefix}.parent_address_zipcode`,
            `${pathPrefix}.parent_address_state`,
            `${pathPrefix}.parent_address_city`,
            `${pathPrefix}.parent_address_line1`,
            `${pathPrefix}.parent_address_line2`
        ];

        if (watchIsAddressSame === 'Yes') {
            setValue(`${pathPrefix}.parent_address_country` as keyof AdmissionRegistrationFormData, getValues("comm_address_country"), { shouldValidate: true });
            setValue(`${pathPrefix}.parent_address_zipcode` as keyof AdmissionRegistrationFormData, getValues("comm_address_area_code"), { shouldValidate: true });
            const appState = getValues("comm_address_state");
            const appCity = getValues("comm_address_city");
            setValue(`${pathPrefix}.parent_address_state` as keyof AdmissionRegistrationFormData, appState, { shouldValidate: true });
            setValue(`${pathPrefix}.parent_address_city` as keyof AdmissionRegistrationFormData, appCity, { shouldValidate: true });
            setValue(`${pathPrefix}.parent_address_line1` as keyof AdmissionRegistrationFormData, getValues("comm_address_line_1"), { shouldValidate: true });
            setValue(`${pathPrefix}.parent_address_line2` as keyof AdmissionRegistrationFormData, getValues("comm_address_line_2") || "", { shouldValidate: true });

            setParentAddrStateOptions(appState ? [appState] : []);
            setParentAddrCityOptions(appCity ? [appCity] : []);
            setParentAddrError(null);
            setIsParentAddrLoading(false);
            activeFetchIdentifier.current = null; // Clear any pending fetch idea
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); // Clear debounce
        } else if (watchIsAddressSame === 'No') {
            setValue(`${pathPrefix}.parent_address_country` as keyof AdmissionRegistrationFormData, getValues(`${pathPrefix}.parent_address_country`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.parent_address_zipcode` as keyof AdmissionRegistrationFormData, getValues(`${pathPrefix}.parent_address_zipcode`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.parent_address_state` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
            setValue(`${pathPrefix}.parent_address_city` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
            setValue(`${pathPrefix}.parent_address_line1` as keyof AdmissionRegistrationFormData, getValues(`${pathPrefix}.parent_address_line1`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.parent_address_line2` as keyof AdmissionRegistrationFormData, getValues(`${pathPrefix}.parent_address_line2`) || "", { shouldValidate: false });

            setParentAddrStateOptions([]);
            setParentAddrCityOptions([]);
            setParentAddrError(null);
            // setIsParentAddrLoading(false); // Fetch effect will manage this
            trigger(fieldsToTrigger);
        }
    }, [watchIsAddressSame, getValues, setValue, pathPrefix, trigger]);

    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        // activeFetchIdentifier.current = null; // Reset when inputs change, before deciding to fetch

        if (watchIsAddressSame === 'No') {
            if (parentAddressCountryName && parentAddressZipcode && parentAddressZipcode.length >= 3) {
                const currentFetchId = `${parentAddressCountryName}-${parentAddressZipcode}`;
                if (activeFetchIdentifier.current === currentFetchId && isParentAddrLoading) {
                    // A fetch for these exact inputs is already loading, or was the last one.
                    return;
                }
                // If not loading, but activeFetchIdentifier is for something else, clear it.
                if (activeFetchIdentifier.current && activeFetchIdentifier.current !== currentFetchId) {
                    activeFetchIdentifier.current = null;
                }


                const countryObj = countries.all.find(c => c.name === parentAddressCountryName);
                if (countryObj && countryObj.alpha2) {
                    const countryISO2 = countryObj.alpha2;
                    // Set a new active fetch identifier BEFORE starting the timer
                    // activeFetchIdentifier.current = currentFetchId; // Moved into fetch function
                    debounceTimeoutRef.current = setTimeout(() => {
                        // Double check before fetching, ensure component still wants this fetch
                        if (watchIsAddressSame === 'No' &&
                            getValues(`${pathPrefix}.parent_address_country`) === parentAddressCountryName &&
                            getValues(`${pathPrefix}.parent_address_zipcode`) === parentAddressZipcode) {

                            if (!isParentAddrLoading) { // Final check before calling fetch
                                fetchParentAddressDetails(countryISO2, parentAddressZipcode);
                            }
                        }
                    }, 800);
                } else { // Invalid country name
                    setParentAddrStateOptions([]); setParentAddrCityOptions([]);
                    setValue(`${pathPrefix}.parent_address_state` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
                    setValue(`${pathPrefix}.parent_address_city` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
                    setParentAddrError(parentAddressCountryName ? `Invalid country or ISO code not found.` : "Select country.");
                    setIsParentAddrLoading(false); activeFetchIdentifier.current = null;
                }
            } else { // Conditions for fetch not met
                setParentAddrStateOptions([]); setParentAddrCityOptions([]);
                if (!parentAddressCountryName || !parentAddressZipcode || (parentAddressZipcode && parentAddressZipcode.length < 3 && parentAddressZipcode.length > 0)) {
                    setValue(`${pathPrefix}.parent_address_state` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
                    setValue(`${pathPrefix}.parent_address_city` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
                }
                if (parentAddressCountryName && parentAddressZipcode && parentAddressZipcode.length > 0 && parentAddressZipcode.length < 3) {
                    setParentAddrError("Zipcode is too short.");
                } else { setParentAddrError(null); }
                setIsParentAddrLoading(false); activeFetchIdentifier.current = null;
            }
        } else { // Address is 'Yes'
            setIsParentAddrLoading(false); setParentAddrError(null); activeFetchIdentifier.current = null;
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        }
        return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
    }, [
        watchIsAddressSame,
        parentAddressCountryName,
        parentAddressZipcode,
        // isParentAddrLoading, // REMOVE isParentAddrLoading from here if fetch itself manages it.
        // Keeping it can be tricky. Let's try without.
        fetchParentAddressDetails,
        setValue,
        pathPrefix,
        getValues // Added getValues as it's used in the effect
    ]);

    return (
        // JSX remains the same as your last provided version
        // Ensure FormDescription for loading and FormMessage for error are correctly placed under Zipcode field
        <div className="p-4 border rounded-md space-y-6 bg-slate-50 dark:bg-slate-800/30 shadow-sm">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Parent {index + 1} Details
                </h3>
                {totalParents > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeParent(index)} className="text-destructive hover:bg-destructive/10">
                        Remove Parent {index + 1}
                    </Button>
                )}
            </div>

            {/* Basic Information */}
            <div className="pt-3 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.parent_first_name`} render={({ field }) => (<FormItem><FormLabel>First Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="First Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.parent_last_name`} render={({ field }) => (<FormItem><FormLabel>Last Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Last Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.parent_relation`} render={({ field }) => (
                        <FormItem><FormLabel>Relation<span className="text-destructive"> *</span></FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_relation`); }} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Relation" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_RELATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.parent_nationality`} render={({ field }) => (
                        <FormItem><FormLabel>Nationality<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.parent_nationality`); }}
                                placeholder="Select Nationality" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.parent_country_of_residence`} render={({ field }) => (
                        <FormItem><FormLabel>Country of Residence<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.parent_country_of_residence`); }}
                                placeholder="Select Country of Residence" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Contact Information */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                    <FormField control={control} name={`${pathPrefix}.parent_contact_email`} render={({ field }) => (<FormItem><FormLabel>Contact Email Address<span className="text-destructive"> *</span></FormLabel><FormControl><Input type="email" placeholder="Email Address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.parent_contact_phone`} render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <PhoneInput defaultCountry="IN" placeholder="Enter phone number" {...field} onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_contact_phone`); }} value={field.value ?? ''} />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.parent_is_whatsapp_same`} render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-7">
                            <FormControl><Checkbox checked={field.value ?? true} onCheckedChange={(checkedBool) => {
                                field.onChange(checkedBool);
                                trigger(`${pathPrefix}.parent_is_whatsapp_same`);
                                if (checkedBool) setValue(`${pathPrefix}.parent_whatsapp_number`, "");
                                else setValue(`${pathPrefix}.parent_whatsapp_number`, getValues(`${pathPrefix}.parent_contact_phone`) || "");
                                if (!checkedBool) trigger(`${pathPrefix}.parent_whatsapp_number`);
                            }} /></FormControl>
                            <FormLabel className="font-normal text-sm">WhatsApp same as Phone?</FormLabel>
                        </FormItem>
                    )} />
                    {watchIsWhatsappSame === false && (
                        <FormField control={control} name={`${pathPrefix}.parent_whatsapp_number`} render={({ field }) => (
                            <FormItem className="lg:col-start-2"><FormLabel>WhatsApp Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <PhoneInput defaultCountry="IN" placeholder="Enter WhatsApp number" {...field} onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_whatsapp_number`); }} value={field.value ?? ''} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                </div>
            </div>

            {/* Parent Address Toggle */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Parent Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.parent_is_address_same_as_applicant`} render={({ field }) => (
                        <FormItem><FormLabel>Address same as Applicant's Communication Address?<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    trigger(`${pathPrefix}.parent_is_address_same_as_applicant`);
                                }}
                                value={field.value ?? ''}
                            >
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Yes/No" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            {/* Parent Address Details (Conditional) */}
            {watchIsAddressSame === 'No' && (
                <div className="pt-3 mt-4 border-t border-dashed">
                    <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Parent Address Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                        <FormField control={control} name={`${pathPrefix}.parent_address_country`} render={({ field }) => (
                            <FormItem><FormLabel>Country<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <CountryDropdown
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    onChange={(country?: Country) => {
                                        const countryName = country?.name || "";
                                        field.onChange(countryName);
                                        trigger(`${pathPrefix}.parent_address_country`);
                                        setValue(`${pathPrefix}.parent_address_zipcode` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false }); // Clear zip on country change
                                        setValue(`${pathPrefix}.parent_address_state` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
                                        setValue(`${pathPrefix}.parent_address_city` as keyof AdmissionRegistrationFormData, "", { shouldValidate: false });
                                        setParentAddrStateOptions([]);
                                        setParentAddrCityOptions([]);
                                        setParentAddrError(null);
                                    }}
                                    placeholder="Select Country"
                                />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.parent_address_zipcode`} render={({ field }) => (
                            <FormItem><FormLabel>Zipcode<span className="text-destructive"> *</span></FormLabel>
                                <FormControl><Input placeholder="Zipcode" {...field} value={field.value ?? ''} disabled={!parentAddressCountryName} /></FormControl>
                                {isParentAddrLoading && <FormDescription>Loading address...</FormDescription>}
                                {parentAddrError && <FormMessage>{parentAddrError}</FormMessage>}
                                {!parentAddrError && !isParentAddrLoading && <FormMessage />} {/* RHF error */}
                            </FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.parent_address_state`} render={({ field }) => (
                            <FormItem><FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                <Select onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_address_state`); }} value={field.value ?? ''} disabled={isParentAddrLoading || parentAddrStateOptions.length === 0 || !parentAddressZipcode || !parentAddressCountryName}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isParentAddrLoading ? "Loading..." : (parentAddrStateOptions.length > 0 ? "Select state" : "Enter country & zipcode")} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {parentAddrStateOptions.length > 0 ? parentAddrStateOptions.map(s => <SelectItem key={`${pathPrefix}-state-${s}`} value={s}>{s}</SelectItem>)
                                            : <SelectItem value="no-opts" disabled>{!parentAddressCountryName ? "Select country" : (parentAddressZipcode && parentAddressZipcode.length >= 3 ? "No states found" : "Enter zipcode")}</SelectItem>}
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.parent_address_city`} render={({ field }) => (
                            <FormItem><FormLabel>City<span className="text-destructive"> *</span></FormLabel>
                                <Select onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_address_city`); }} value={field.value ?? ''} disabled={isParentAddrLoading || parentAddrCityOptions.length === 0 || !parentAddressZipcode || !parentAddressCountryName}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isParentAddrLoading ? "Loading..." : (parentAddrCityOptions.length > 0 ? "Select city" : "Enter country & zipcode")} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {parentAddrCityOptions.length > 0 ? parentAddrCityOptions.map(c => <SelectItem key={`${pathPrefix}-city-${c}`} value={c}>{c}</SelectItem>)
                                            : <SelectItem value="no-opts" disabled>{!parentAddressCountryName ? "Select country" : (parentAddressZipcode && parentAddressZipcode.length >= 3 ? "No cities found" : "Enter zipcode")}</SelectItem>}
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.parent_address_line1`} render={({ field }) => (<FormItem><FormLabel>Address Line 1<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`${pathPrefix}.parent_address_line2`} render={({ field }) => (<FormItem><FormLabel>Address Line 2<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}

            {/* Educational Information */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Educational Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.parent_education`} render={({ field }) => (
                        <FormItem><FormLabel>Education<span className="text-destructive"> *</span></FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_education`); }} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Education Level" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_EDUCATION_LEVEL_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.parent_field_of_study`} render={({ field }) => (<FormItem><FormLabel>Field of Study<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="e.g., Computer Science, Arts" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            {/* Professional Information */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.parent_profession`} render={({ field }) => (
                        <FormItem><FormLabel>Profession<span className="text-destructive"> *</span></FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.parent_profession`); }} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Profession" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_PROFESSION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.parent_organization_name`} render={({ field }) => (<FormItem><FormLabel>Organization Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Organization Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.parent_designation`} render={({ field }) => (<FormItem><FormLabel>Designation<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Designation" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.parent_annual_income`} render={({ field }) => (
                        <FormItem className="lg:col-span-1">
                            <FormLabel>Annual Income (in INR)<span className="text-destructive"> *</span></FormLabel>
                            <FormControl><Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g., 1000000" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>
    );
};