// src/components/forms/admission/StudentGuardianDetailSection.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Control, useFormContext, UseFieldArrayRemove, UseFormSetValue, UseFormGetValues, Path } from 'react-hook-form';
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
import { Country, GUARDIAN_RELATION_OPTIONS, PARENT_EDUCATION_LEVEL_OPTIONS, PARENT_PROFESSION_OPTIONS } from './admissionFormTabUtils';

interface StudentGuardianDetailSectionProps {
    control: Control<AdmissionRegistrationFormDataYup, undefined>;
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

    const watchGuardianIsWhatsappSame = watch(`${pathPrefix}.is_whatsapp_same`);
    const watchGuardianIsAddressSame = watch(`${pathPrefix}.is_address_same_as_applicant`);
    const guardianAddressCountryName = watch(`${pathPrefix}.country`);
    const guardianAddressZipcode = watch(`${pathPrefix}.zipcode`);

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
        const rhfStateField = `${pathPrefix}.address_state`; // No longer need 'as keyof...'
        const rhfCityField = `${pathPrefix}.address_city`;

        try {
            const response = await fetch(apiUrl);
            if (activeFetchIdentifier.current !== currentFetchId) return;

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Pincode ${zipcode} not found or API error: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.state) {
                const stateValue = data.state;
                setValue(rhfStateField as any, stateValue, { shouldValidate: true });

                let cityToSet = "";
                if (data.acceptedCities && Array.isArray(data.acceptedCities) && data.acceptedCities.length > 0) {
                    cityToSet = data.defaultcity && data.acceptedCities.includes(data.defaultcity)
                        ? data.defaultcity
                        : data.acceptedCities[0];
                }
                setValue(rhfCityField as any, cityToSet, { shouldValidate: true });
                trigger([rhfStateField as any, rhfCityField as any]);
            } else {
                setValue(rhfStateField as any, "", { shouldValidate: true });
                setValue(rhfCityField as any, "", { shouldValidate: true });
                setGuardianAddrError("State not found or invalid data structure from address API.");
                trigger([rhfStateField as any, rhfCityField as any]);
            }
        } catch (error: any) {
            if (activeFetchIdentifier.current === currentFetchId) {
                setValue(rhfStateField as any, "", { shouldValidate: true });
                setValue(rhfCityField as any, "", { shouldValidate: true });
                setGuardianAddrError(error.message || "Failed to fetch address details.");
                trigger([rhfStateField as any, rhfCityField as any]);
            }
        } finally {
            if (activeFetchIdentifier.current === currentFetchId) {
                setIsGuardianAddrLoading(false);
                activeFetchIdentifier.current = null;
            }
        }
    }, [setValue, pathPrefix, trigger, setIsGuardianAddrLoading, setGuardianAddrError]); // Added setters

    // useEffect for syncing address when 'is_address_same_as_applicant' changes
    useEffect(() => {
        const fieldsToTriggerOnNo: Path<AdmissionRegistrationFormDataYup>[] = [
            `${pathPrefix}.country` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.zipcode` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.state` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.city` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.address_line_1` as Path<AdmissionRegistrationFormDataYup>,
        ];
        const fieldsToTriggerOnYes: Path<AdmissionRegistrationFormDataYup>[] = [ // Also trigger validation when copying
            `${pathPrefix}.country` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.zipcode` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.state` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.city` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.address_line_1` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.address_line_2` as Path<AdmissionRegistrationFormDataYup>,
        ];


        if (watchGuardianIsAddressSame === 'Yes') {
            const commCountry = getValues("country");
            const commZip = getValues("zipcode");
            const commState = getValues("state");
            const commCity = getValues("city");
            const commL1 = getValues("address_line_1");
            const commL2 = getValues("address_line_2");

            setValue(`${pathPrefix}.country`, commCountry, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.zipcode`, commZip, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.state`, commState, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.city`, commCity, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.address_line_1`, commL1, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.address_line_2`, commL2 || "", { shouldValidate: true, shouldDirty: true, shouldTouch: true });

            // No longer need to set local state for dropdown options
            // setGuardianAddrStateOptions(commState ? [commState] : []);
            // setGuardianAddrCityOptions(commCity ? [commCity] : []);
            setGuardianAddrError(null);
            setIsGuardianAddrLoading(false);
            activeFetchIdentifier.current = null;
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            trigger(fieldsToTriggerOnYes); // Validate the fields after setting them

        } else if (watchGuardianIsAddressSame === 'No') {
            // When switching to 'No', decide if you want to clear or retain previous 'No' values.
            // This example retains existing 'No' values or defaults to empty.
            setValue(`${pathPrefix}.country`, getValues(`${pathPrefix}.country`) || undefined, { shouldValidate: false });
            setValue(`${pathPrefix}.zipcode`, getValues(`${pathPrefix}.zipcode`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.state`, "", { shouldValidate: true }); // Clear and validate
            setValue(`${pathPrefix}.city`, "", { shouldValidate: true });  // Clear and validate
            setValue(`${pathPrefix}.address_line_1`, getValues(`${pathPrefix}.address_line_1`) || "", { shouldValidate: false });
            setValue(`${pathPrefix}.address_line_2`, getValues(`${pathPrefix}.address_line_2`) || "", { shouldValidate: false });

            // No longer need to set local state for dropdown options
            // setGuardianAddrStateOptions([]);
            // setGuardianAddrCityOptions([]);
            setGuardianAddrError(null);
            // Don't set loading to false here, the other useEffect will manage it if a fetch attempt is made
            trigger(fieldsToTriggerOnNo); // Validate required fields that are now empty or might become required
        }
    }, [watchGuardianIsAddressSame, getValues, setValue, pathPrefix, trigger]);

    // useEffect for fetching address details based on country and zipcode
    useEffect(() => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

        if (watchGuardianIsAddressSame !== 'No') {
            // If address is same as applicant, or not yet decided, don't fetch.
            // Clear any potential previous fetch artifacts if not 'No'.
            // This part ensures that if user toggles Yes->No->Yes, state is clean.
            setValue(`${pathPrefix}.state`, getValues("state") || "", { shouldValidate: watchGuardianIsAddressSame === 'Yes' });
            setValue(`${pathPrefix}.city`, getValues("city") || "", { shouldValidate: watchGuardianIsAddressSame === 'Yes' });
            setGuardianAddrError(null);
            setIsGuardianAddrLoading(false);
            activeFetchIdentifier.current = null;
            return;
        }

        // Proceed only if watchGuardianIsAddressSame === 'No'
        if (guardianAddressCountryName && guardianAddressZipcode && guardianAddressZipcode.length >= 3) {
            const currentFetchId = `${guardianAddressCountryName}-${guardianAddressZipcode}`;
            if (activeFetchIdentifier.current === currentFetchId && isGuardianAddrLoading) return;
            if (activeFetchIdentifier.current && activeFetchIdentifier.current !== currentFetchId) activeFetchIdentifier.current = null;

            const countryObj = countries.all.find(c => c.name === guardianAddressCountryName);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                setGuardianAddrError(null);

                debounceTimeoutRef.current = setTimeout(() => {
                    if (
                        watchGuardianIsAddressSame === 'No' &&
                        getValues(`${pathPrefix}.country`) === guardianAddressCountryName &&
                        getValues(`${pathPrefix}.zipcode`) === guardianAddressZipcode
                    ) {
                        // Call the local fetchGuardianAddressDetails (useCallback version)
                        fetchGuardianAddressDetails(countryISO2, guardianAddressZipcode);
                    }
                }, 800);
            } else {
                setValue(`${pathPrefix}.state`, "" as string, { shouldValidate: false });
                setValue(`${pathPrefix}.city`, "" as string, { shouldValidate: false });
                if (guardianAddressCountryName) {
                    setGuardianAddrError(`Invalid country ('${guardianAddressCountryName}') or ISO code not found.`);
                } else {
                    setGuardianAddrError("Please select a country first.");
                }
                setIsGuardianAddrLoading(false);
                activeFetchIdentifier.current = null;
            }
        } else { // Conditions for fetch not met
            setValue(`${pathPrefix}.state`, "" as string, { shouldValidate: false });
            setValue(`${pathPrefix}.city`, "" as string, { shouldValidate: false });

            if (guardianAddressCountryName && guardianAddressZipcode && guardianAddressZipcode.length > 0 && guardianAddressZipcode.length < 3) {
                setGuardianAddrError("PIN / ZIP Code is too short (minimum 3 characters).");
            } else if (!guardianAddressCountryName && guardianAddressZipcode && guardianAddressZipcode.length >= 3) {
                setGuardianAddrError("Please select a country.");
            } else {
                setGuardianAddrError(null);
            }
            setIsGuardianAddrLoading(false);
            activeFetchIdentifier.current = null;
        }

        return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
    }, [
        watchGuardianIsAddressSame,
        guardianAddressCountryName,
        guardianAddressZipcode,
        fetchGuardianAddressDetails, // This is now the useCallback defined in this component
        setValue,
        pathPrefix,
        getValues,
        // setIsGuardianAddrLoading, // Already deps of fetchGuardianAddressDetails via useCallback
        // setGuardianAddrError   // Already deps of fetchGuardianAddressDetails via useCallback
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
                        name={`${pathPrefix}.relation`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Relation with Applicant<span className="text-destructive"> *</span></FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        trigger(`${pathPrefix}.relation`);
                                    }}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) {
                                            field.onBlur();
                                            trigger(`${pathPrefix}.relation`);
                                        }
                                    }}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Relation" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {GUARDIAN_RELATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name={`${pathPrefix}.first_name`} render={({ field }) => (<FormItem><FormLabel>First Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Guardian's First Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.last_name`} render={({ field }) => (<FormItem><FormLabel>Last Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Guardian's Last Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.nationality`} render={({ field }) => (
                        <FormItem><FormLabel>Nationality<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                onBlur={field.onBlur}
                                value={field.value}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.nationality`); }}
                                placeholder="Select Nationality" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.country_of_residence`} render={({ field }) => (
                        <FormItem><FormLabel>Country of Residence<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.country_of_residence`); }} placeholder="Select Country of Residence" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Contact Information */}
            <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                    <FormField control={control} name={`${pathPrefix}.contact_email`} render={({ field }) => (<FormItem><FormLabel>Contact Email Address<span className="text-destructive"> *</span></FormLabel><FormControl><Input type="email" placeholder="Email Address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.contact_phone`} render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <PhoneInput
                                placeholder="Enter phone number"
                                {...field}
                                onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.contact_phone`); }} value={field.value ?? ''} />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.is_whatsapp_same`} render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-7">
                            <FormControl><Checkbox checked={field.value ?? true} onCheckedChange={(checkedBool) => {
                                field.onChange(checkedBool);
                                trigger(`${pathPrefix}.is_whatsapp_same`);
                                if (checkedBool) setValue(`${pathPrefix}.whatsapp_phone`, "");
                                else setValue(`${pathPrefix}.whatsapp_phone`, getValues(`${pathPrefix}.contact_phone`) || "");
                                if (!checkedBool) trigger(`${pathPrefix}.whatsapp_phone`);
                            }} /></FormControl>
                            <FormLabel className="font-normal text-sm">WhatsApp same as Phone?</FormLabel>
                        </FormItem>
                    )} />
                    {watchGuardianIsWhatsappSame === false && (
                        <FormField control={control} name={`${pathPrefix}.whatsapp_phone`} render={({ field }) => (
                            <FormItem className="lg:col-start-2"><FormLabel>WhatsApp Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <PhoneInput
                                    placeholder="Enter WhatsApp number"
                                    {...field}
                                    onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.whatsapp_phone`); }} value={field.value ?? ''} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                </div>
            </div>

            {/* Guardian Address Toggle */}
            <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Guardian Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.is_address_same_as_applicant`} render={({ field }) => (
                        <FormItem><FormLabel>Address same as Applicant's Communication Address?<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.is_address_same_as_applicant`); }}
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        field.onBlur();
                                        trigger(`${pathPrefix}.is_address_same_as_applicant`);
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
                        <FormField control={control} name={`${pathPrefix}.country`} render={({ field }) => (
                            <FormItem><FormLabel>Country<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <CountryDropdown
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    onChange={(country?: Country) => {
                                        const countryName = country?.name || "";
                                        field.onChange(countryName);
                                        trigger(`${pathPrefix}.country`);
                                        setValue(`${pathPrefix}.zipcode` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setValue(`${pathPrefix}.state` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setValue(`${pathPrefix}.city` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setGuardianAddrError(null);
                                    }} placeholder="Select Country" />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.zipcode`} render={({ field, fieldState }) => (
                            <FormItem><FormLabel>PIN / ZIP Code<span className="text-destructive"> *</span></FormLabel>
                                <FormControl><Input placeholder="PIN / ZIP Code" {...field} value={field.value ?? ''} disabled={!guardianAddressCountryName} /></FormControl>
                                {isGuardianAddrLoading && <FormDescription>Loading address...</FormDescription>}
                                {guardianAddrError && !fieldState.error && <FormMessage className="text-destructive">{guardianAddrError}</FormMessage>}
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField
                            control={control}
                            name={`${pathPrefix}.state`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State<span className="text-destructive"> *</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="State (auto-filled)"
                                            {...field}
                                            value={field.value ?? ''}
                                            disabled // Make the input disabled
                                            className="bg-muted cursor-not-allowed"
                                        />
                                    </FormControl>
                                    {isGuardianAddrLoading && !field.value && <FormDescription>Loading state...</FormDescription>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Guardian City (Enabled Text Input) */}
                        <FormField
                            control={control}
                            name={`${pathPrefix}.city`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City/ Town<span className="text-destructive"> *</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter city/town"
                                            {...field}
                                            value={field.value ?? ''}
                                            disabled={isGuardianAddrLoading && !field.value} // Optionally disable while loading if empty
                                        />
                                    </FormControl>
                                    {isGuardianAddrLoading && !field.value && <FormDescription>Loading city...</FormDescription>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={control} name={`${pathPrefix}.address_line_1`} render={({ field }) => (<FormItem><FormLabel>Address Line 1<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`${pathPrefix}.address_line_2`} render={({ field }) => (<FormItem><FormLabel>Address Line 2<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}

            {/* Educational Information */}
            <div className="pt-3 mt-4 border-t border-dashed border-indigo-300 dark:border-indigo-700">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Educational Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.education`} render={({ field }) => (
                        <FormItem><FormLabel>Education<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        field.onBlur();
                                        trigger(`${pathPrefix}.education`);
                                    }
                                }}
                                onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.education`); }} value={field.value ?? ''}
                            ><FormControl><SelectTrigger><SelectValue placeholder="Select Education Level" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_EDUCATION_LEVEL_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.field_of_study`} render={({ field }) => (<FormItem><FormLabel>Field of Study<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="e.g., Computer Science, Arts" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            {/* Professional Information - WITH NEW FIELDS */}
            <div className="pt-3 mt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                <h4 className="text-md font-semibold mb-3 text-slate-600 dark:text-slate-300">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                    <FormField
                        control={control}
                        name={`${pathPrefix}.profession`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profession<span className="text-destructive"> *</span></FormLabel>
                                <Select
                                    onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.education`); }}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) {
                                            field.onBlur();
                                            trigger(`${pathPrefix}.profession`);
                                        }
                                    }}
                                    value={field.value ?? ''}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Profession" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {PARENT_PROFESSION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name={`${pathPrefix}.organization_name`} render={({ field }) => (
                        <FormItem><FormLabel>Organization Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Organization Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.designation`} render={({ field }) => (
                        <FormItem><FormLabel>Designation<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Designation" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.annual_income`} render={({ field }) => (
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