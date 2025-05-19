// src/components/forms/admission/StudentGuardianDetailSection.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Control, useFormContext, UseFieldArrayRemove, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
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
import type { AdmissionRegistrationFormDataYup } from './yupSchema'; // Use Yup schema type
import { countries } from "country-data-list";
import { Country, GUARDIAN_RELATION_OPTIONS_YUP, PARENT_EDUCATION_LEVEL_OPTIONS_YUP, PARENT_PROFESSION_OPTIONS_YUP } from './admissionFormTabUtils';

interface StudentGuardianDetailSectionProps {
    control: Control<AdmissionRegistrationFormDataYup, any>;
    index: number;
    removeGuardian: UseFieldArrayRemove;
    totalGuardians: number;
    getValues: UseFormGetValues<AdmissionRegistrationFormDataYup>;
    setValue: UseFormSetValue<AdmissionRegistrationFormDataYup>;
}

export const StudentGuardianDetailSection: React.FC<StudentGuardianDetailSectionProps> = ({
    control,
    index,
    removeGuardian,
    getValues,
    setValue,
    totalGuardians
}) => {
    const { watch, trigger } = useFormContext<AdmissionRegistrationFormDataYup>();
    const pathPrefix = `student_guardians.${index}` as const;

    const watchGuardianIsWhatsappSame = watch(`${pathPrefix}.guardian_is_whatsapp_same`);
    const watchGuardianIsAddressSame = watch(`${pathPrefix}.guardian_is_address_same_as_applicant`);
    const guardianAddressCountryName = watch(`${pathPrefix}.guardian_address_country`);
    const guardianAddressZipcode = watch(`${pathPrefix}.guardian_address_zipcode`);

    const [guardianAddrStateOptions, setGuardianAddrStateOptions] = useState<string[]>([]);
    const [guardianAddrCityOptions, setGuardianAddrCityOptions] = useState<string[]>([]);
    const [isGuardianAddrLoading, setIsGuardianAddrLoading] = useState(false);
    const [guardianAddrError, setGuardianAddrError] = useState<string | null>(null);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activeFetchIdentifier = useRef<string | null>(null);

    const fetchGuardianAddressDetails = useCallback(async (countryISO2: string, zipcode: string) => {
        const currentFetchId = `${countryISO2}-${zipcode}`;
        activeFetchIdentifier.current = currentFetchId;
        setIsGuardianAddrLoading(true);
        setGuardianAddrError(null);

        const apiUrl = `https://cdi-gateway.isha.in/contactinfovalidation/api/countries/${countryISO2}/pincodes/${zipcode}`;
        const rhfStateField = `${pathPrefix}.guardian_address_state` as keyof AdmissionRegistrationFormDataYup;
        const rhfCityField = `${pathPrefix}.guardian_address_city` as keyof AdmissionRegistrationFormDataYup;

        try {
            const response = await fetch(apiUrl);
            if (activeFetchIdentifier.current !== currentFetchId) return;

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Pincode ${zipcode} not found or API error: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.state && data.acceptedCities && Array.isArray(data.acceptedCities)) {
                const stateArray = [data.state];
                const citiesArray = data.acceptedCities;
                setGuardianAddrStateOptions(stateArray);
                setGuardianAddrCityOptions(citiesArray);
                setValue(rhfStateField, stateArray[0] || "", { shouldValidate: true });
                const cityToSet = data.defaultcity && citiesArray.includes(data.defaultcity) ? data.defaultcity : (citiesArray[0] || "");
                setValue(rhfCityField, cityToSet, { shouldValidate: true });
                trigger([rhfStateField, rhfCityField]);
            } else {
                setGuardianAddrStateOptions([]); setGuardianAddrCityOptions([]);
                setValue(rhfStateField, "", { shouldValidate: true }); setValue(rhfCityField, "", { shouldValidate: true });
                setGuardianAddrError("Invalid data structure from address API.");
                trigger([rhfStateField, rhfCityField]);
            }
        } catch (error: any) {
            if (activeFetchIdentifier.current === currentFetchId) {
                setGuardianAddrStateOptions([]); setGuardianAddrCityOptions([]);
                setValue(rhfStateField, "", { shouldValidate: true }); setValue(rhfCityField, "", { shouldValidate: true });
                setGuardianAddrError(error.message || "Failed to fetch address details.");
                trigger([rhfStateField, rhfCityField]);
            }
        } finally {
            if (activeFetchIdentifier.current === currentFetchId) {
                setIsGuardianAddrLoading(false);
                activeFetchIdentifier.current = null;
            }
        }
    }, [setValue, pathPrefix, trigger]);

    useEffect(() => {
        const fieldsToTrigger = [
            `${pathPrefix}.guardian_address_country`, `${pathPrefix}.guardian_address_zipcode`,
            `${pathPrefix}.guardian_address_state`, `${pathPrefix}.guardian_address_city`,
            `${pathPrefix}.guardian_address_line1`, `${pathPrefix}.guardian_address_line2`
        ] as unknown as Parameters<typeof trigger>[0]; // Correct type for trigger

        if (watchGuardianIsAddressSame === 'Yes') {
            setValue(`${pathPrefix}.guardian_address_country` as keyof AdmissionRegistrationFormDataYup, getValues("comm_address_country"), { shouldValidate: true });
            setValue(`${pathPrefix}.guardian_address_zipcode` as keyof AdmissionRegistrationFormDataYup, getValues("comm_address_area_code"), { shouldValidate: true });
            const appState = getValues("comm_address_state");
            const appCity = getValues("comm_address_city");
            setValue(`${pathPrefix}.guardian_address_state` as keyof AdmissionRegistrationFormDataYup, appState, { shouldValidate: true });
            setValue(`${pathPrefix}.guardian_address_city` as keyof AdmissionRegistrationFormDataYup, appCity, { shouldValidate: true });
            setValue(`${pathPrefix}.guardian_address_line1` as keyof AdmissionRegistrationFormDataYup, getValues("comm_address_line_1"), { shouldValidate: true });
            setValue(`${pathPrefix}.guardian_address_line2` as keyof AdmissionRegistrationFormDataYup, getValues("comm_address_line_2") || "", { shouldValidate: true });

            setGuardianAddrStateOptions(appState ? [appState] : []);
            setGuardianAddrCityOptions(appCity ? [appCity] : []);
            setGuardianAddrError(null);
            setIsGuardianAddrLoading(false);
            activeFetchIdentifier.current = null;
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        } else if (watchGuardianIsAddressSame === 'No') {
            setValue(`${pathPrefix}.guardian_address_country` as keyof AdmissionRegistrationFormDataYup, getValues(`${pathPrefix}.guardian_address_country`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.guardian_address_zipcode` as keyof AdmissionRegistrationFormDataYup, getValues(`${pathPrefix}.guardian_address_zipcode`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.guardian_address_state` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
            setValue(`${pathPrefix}.guardian_address_city` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
            setValue(`${pathPrefix}.guardian_address_line1` as keyof AdmissionRegistrationFormDataYup, getValues(`${pathPrefix}.guardian_address_line1`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.guardian_address_line2` as keyof AdmissionRegistrationFormDataYup, getValues(`${pathPrefix}.guardian_address_line2`) || "", { shouldValidate: false });

            setGuardianAddrStateOptions([]);
            setGuardianAddrCityOptions([]);
            setGuardianAddrError(null);
            trigger(fieldsToTrigger);
        }
    }, [watchGuardianIsAddressSame, getValues, setValue, pathPrefix, trigger]);

    useEffect(() => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

        if (watchGuardianIsAddressSame === 'No') {
            if (guardianAddressCountryName && guardianAddressZipcode && guardianAddressZipcode.length >= 3) {
                const currentFetchId = `${guardianAddressCountryName}-${guardianAddressZipcode}`;
                if (activeFetchIdentifier.current === currentFetchId && isGuardianAddrLoading) return;
                if (activeFetchIdentifier.current && activeFetchIdentifier.current !== currentFetchId) activeFetchIdentifier.current = null;

                const countryObj = countries.all.find(c => c.name === guardianAddressCountryName);
                if (countryObj && countryObj.alpha2) {
                    const countryISO2 = countryObj.alpha2;
                    debounceTimeoutRef.current = setTimeout(() => {
                        if (watchGuardianIsAddressSame === 'No' &&
                            getValues(`${pathPrefix}.guardian_address_country`) === guardianAddressCountryName &&
                            getValues(`${pathPrefix}.guardian_address_zipcode`) === guardianAddressZipcode) {
                            if (!isGuardianAddrLoading) {
                                fetchGuardianAddressDetails(countryISO2, guardianAddressZipcode);
                            }
                        }
                    }, 800);
                } else {
                    setGuardianAddrStateOptions([]); setGuardianAddrCityOptions([]);
                    setValue(`${pathPrefix}.guardian_address_state` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                    setValue(`${pathPrefix}.guardian_address_city` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                    setGuardianAddrError(guardianAddressCountryName ? `Invalid country or ISO code not found.` : "Select country.");
                    setIsGuardianAddrLoading(false); activeFetchIdentifier.current = null;
                }
            } else {
                setGuardianAddrStateOptions([]); setGuardianAddrCityOptions([]);
                if (!guardianAddressCountryName || !guardianAddressZipcode || (guardianAddressZipcode && guardianAddressZipcode.length < 3 && guardianAddressZipcode.length > 0)) {
                    setValue(`${pathPrefix}.guardian_address_state` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                    setValue(`${pathPrefix}.guardian_address_city` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                }
                if (guardianAddressCountryName && guardianAddressZipcode && guardianAddressZipcode.length > 0 && guardianAddressZipcode.length < 3) {
                    setGuardianAddrError("Zipcode is too short.");
                } else { setGuardianAddrError(null); }
                setIsGuardianAddrLoading(false); activeFetchIdentifier.current = null;
            }
        } else {
            setIsGuardianAddrLoading(false); setGuardianAddrError(null); activeFetchIdentifier.current = null;
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        }
        return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
    }, [
        watchGuardianIsAddressSame,
        guardianAddressCountryName,
        guardianAddressZipcode,
        fetchGuardianAddressDetails, // Now refers to the local, memoized version
        setValue,
        pathPrefix,
        getValues
        // REMOVED isGuardianAddrLoading from this dependency array
    ]);

    return (
        // JSX is identical to the working Parent section, just with "guardian" path prefixes
        <div className="p-4 border rounded-md space-y-6 bg-blue-50 dark:bg-blue-900/20 shadow-sm mt-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                    Guardian Details
                </h3>
                {totalGuardians > 1 && <Button type="button" variant="destructive" className="w-auto" size="sm" onClick={() => removeGuardian(index)}>
                    Remove Guardian {index + 1}
                </Button>}
            </div>

            {/* Basic Information */}
            <div className="pt-3 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField
                        control={control}
                        name={`${pathPrefix}.guardian_relation_with_applicant`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Relation with Applicant<span className="text-destructive"> *</span></FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        trigger(`${pathPrefix}.guardian_relation_with_applicant`);
                                    }}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) {
                                            field.onBlur();
                                            trigger(`${pathPrefix}.guardian_relation_with_applicant`);
                                        }
                                    }}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Relation" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {GUARDIAN_RELATION_OPTIONS_YUP.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name={`${pathPrefix}.guardian_first_name`} render={({ field }) => (<FormItem><FormLabel>First Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Guardian's First Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.guardian_last_name`} render={({ field }) => (<FormItem><FormLabel>Last Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Guardian's Last Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.guardian_nationality`} render={({ field }) => (
                        <FormItem><FormLabel>Nationality<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                onBlur={field.onBlur}
                                value={field.value}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.guardian_nationality`); }}
                                placeholder="Select Nationality" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.guardian_country_of_residence`} render={({ field }) => (
                        <FormItem><FormLabel>Country of Residence<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.guardian_country_of_residence`); }} placeholder="Select Country of Residence" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Contact Information */}
            <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                    <FormField control={control} name={`${pathPrefix}.guardian_contact_email`} render={({ field }) => (<FormItem><FormLabel>Contact Email Address<span className="text-destructive"> *</span></FormLabel><FormControl><Input type="email" placeholder="Email Address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.guardian_contact_phone`} render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <PhoneInput
                                placeholder="Enter phone number"
                                {...field}
                                onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_contact_phone`); }} value={field.value ?? ''} />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.guardian_is_whatsapp_same`} render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-7">
                            <FormControl><Checkbox checked={field.value ?? true} onCheckedChange={(checkedBool) => {
                                field.onChange(checkedBool);
                                trigger(`${pathPrefix}.guardian_is_whatsapp_same`);
                                if (checkedBool) setValue(`${pathPrefix}.guardian_whatsapp_number`, "");
                                else setValue(`${pathPrefix}.guardian_whatsapp_number`, getValues(`${pathPrefix}.guardian_contact_phone`) || "");
                                if (!checkedBool) trigger(`${pathPrefix}.guardian_whatsapp_number`);
                            }} /></FormControl>
                            <FormLabel className="font-normal text-sm">WhatsApp same as Phone?</FormLabel>
                        </FormItem>
                    )} />
                    {watchGuardianIsWhatsappSame === false && (
                        <FormField control={control} name={`${pathPrefix}.guardian_whatsapp_number`} render={({ field }) => (
                            <FormItem className="lg:col-start-2"><FormLabel>WhatsApp Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <PhoneInput
                                    placeholder="Enter WhatsApp number"
                                    {...field}
                                    onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_whatsapp_number`); }} value={field.value ?? ''} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                </div>
            </div>

            {/* Guardian Address Toggle */}
            <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Guardian Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.guardian_is_address_same_as_applicant`} render={({ field }) => (
                        <FormItem><FormLabel>Address same as Applicant's Communication Address?<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_is_address_same_as_applicant`); }}
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        field.onBlur();
                                        trigger(`${pathPrefix}.guardian_is_address_same_as_applicant`);
                                    }
                                }}
                                value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Yes/No" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Guardian Address Details (Conditional) */}
            {watchGuardianIsAddressSame === 'No' && (
                <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                    <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Guardian Address Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                        <FormField control={control} name={`${pathPrefix}.guardian_address_country`} render={({ field }) => (
                            <FormItem><FormLabel>Country<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <CountryDropdown
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    onChange={(country?: Country) => {
                                        const countryName = country?.name || "";
                                        field.onChange(countryName);
                                        trigger(`${pathPrefix}.guardian_address_country`);
                                        setValue(`${pathPrefix}.guardian_address_zipcode` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setValue(`${pathPrefix}.guardian_address_state` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setValue(`${pathPrefix}.guardian_address_city` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setGuardianAddrStateOptions([]); setGuardianAddrCityOptions([]); setGuardianAddrError(null);
                                    }} placeholder="Select Country" />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.guardian_address_zipcode`} render={({ field, fieldState }) => (
                            <FormItem><FormLabel>Zipcode<span className="text-destructive"> *</span></FormLabel>
                                <FormControl><Input placeholder="Zipcode" {...field} value={field.value ?? ''} disabled={!guardianAddressCountryName} /></FormControl>
                                {isGuardianAddrLoading && <FormDescription>Loading address...</FormDescription>}
                                {guardianAddrError && !fieldState.error && <FormMessage className="text-destructive">{guardianAddrError}</FormMessage>}
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.guardian_address_state`} render={({ field }) => (
                            <FormItem><FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                <Select
                                    onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_address_state`); }} value={field.value ?? ''} disabled={isGuardianAddrLoading || guardianAddrStateOptions.length === 0 || !guardianAddressZipcode || !guardianAddressCountryName}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) {
                                            field.onBlur();
                                            trigger(`${pathPrefix}.guardian_address_state`);
                                        }
                                    }}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder={isGuardianAddrLoading ? "Loading..." : (guardianAddrStateOptions.length > 0 ? "Select state" : "Enter country & zipcode")} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {guardianAddrStateOptions.length > 0 ? guardianAddrStateOptions.map(s => <SelectItem key={`${pathPrefix}-state-${s}`} value={s}>{s}</SelectItem>)
                                            : <SelectItem value="no-opts" disabled>{!guardianAddressCountryName ? "Select country" : (guardianAddressZipcode && guardianAddressZipcode.length >= 3 ? "No states found" : "Enter zipcode")}</SelectItem>}
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.guardian_address_city`} render={({ field }) => (
                            <FormItem><FormLabel>City<span className="text-destructive"> *</span></FormLabel>
                                <Select
                                    onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_address_city`); }} value={field.value ?? ''} disabled={isGuardianAddrLoading || guardianAddrCityOptions.length === 0 || !guardianAddressZipcode || !guardianAddressCountryName}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isGuardianAddrLoading ? "Loading..." : (guardianAddrCityOptions.length > 0 ? "Select city" : "Enter country & zipcode")} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {guardianAddrCityOptions.length > 0 ? guardianAddrCityOptions.map(c => <SelectItem key={`${pathPrefix}-city-${c}`} value={c}>{c}</SelectItem>)
                                            : <SelectItem value="no-opts" disabled>{!guardianAddressCountryName ? "Select country" : (guardianAddressZipcode && guardianAddressZipcode.length >= 3 ? "No cities found" : "Enter zipcode")}</SelectItem>}
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.guardian_address_line1`} render={({ field }) => (<FormItem><FormLabel>Address Line 1<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`${pathPrefix}.guardian_address_line2`} render={({ field }) => (<FormItem><FormLabel>Address Line 2<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}

            {/* Educational Information */}
            <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Educational Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.guardian_education`} render={({ field }) => (
                        <FormItem><FormLabel>Education<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        field.onBlur();
                                        trigger(`${pathPrefix}.guardian_education`);
                                    }
                                }}
                                onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_education`); }} value={field.value ?? ''}
                            ><FormControl><SelectTrigger><SelectValue placeholder="Select Education Level" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_EDUCATION_LEVEL_OPTIONS_YUP.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.guardian_field_of_study`} render={({ field }) => (<FormItem><FormLabel>Field of Study<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="e.g., Computer Science, Arts" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            {/* Professional Information - WITH NEW FIELDS */}
            <div className="pt-3 mt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                <h4 className="text-md font-semibold mb-3 text-slate-600 dark:text-slate-300">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                    <FormField
                        control={control}
                        name={`${pathPrefix}.guardian_profession`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profession<span className="text-destructive"> *</span></FormLabel>
                                <Select
                                    onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.guardian_education`); }}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) {
                                            field.onBlur();
                                            trigger(`${pathPrefix}.guardian_profession`);
                                        }
                                    }}
                                    value={field.value ?? ''}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Profession" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {PARENT_PROFESSION_OPTIONS_YUP.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name={`${pathPrefix}.guardian_organization_name`} render={({ field }) => (
                        <FormItem><FormLabel>Organization Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Organization Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.guardian_designation`} render={({ field }) => (
                        <FormItem><FormLabel>Designation<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Designation" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.guardian_annual_income`} render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-1"> {/* Adjusted for better layout potentially */}
                            <FormLabel>Annual Income (INR)<span className="text-destructive"> *</span></FormLabel>
                            <FormControl><Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g., 1000000" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>
    );
};