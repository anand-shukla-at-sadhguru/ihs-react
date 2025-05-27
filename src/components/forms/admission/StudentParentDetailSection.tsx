// src/components/forms/admission/StudentParentDetailSection.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Control, useFormContext, UseFormSetValue, UseFormGetValues, Path } from 'react-hook-form';
// import { Button } from "@/components/ui/button";
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
import type { AdmissionRegistrationFormDataYup } from './yupSchema';

import { countries } from "country-data-list";
import { Country, PARENT_EDUCATION_LEVEL_OPTIONS } from './admissionFormTabUtils';
import { PARENT_RELATION_OPTIONS, PARENT_PROFESSION_OPTIONS } from './admissionFormTabUtils';
interface StudentParentDetailSectionProps {
    control: Control<AdmissionRegistrationFormDataYup>;
    index: number;
    removeParent: (index: number) => void;
    totalParents: number;
    getValues: UseFormGetValues<AdmissionRegistrationFormDataYup>;
    setValue: UseFormSetValue<AdmissionRegistrationFormDataYup>;
}

export const StudentParentDetailSection: React.FC<StudentParentDetailSectionProps> = ({
    control,
    index,
    removeParent,
    totalParents,
    getValues,
    setValue,
}) => {
    const { watch, trigger } = useFormContext<AdmissionRegistrationFormDataYup>();
    const pathPrefix = `student_parent.${index}` as const;

    const watchIsWhatsappSame = watch(`${pathPrefix}.is_whatsapp_same`);
    const watchIsAddressSame = watch(`${pathPrefix}.is_address_same_as_applicant`);
    const parentAddressCountryName = watch(`${pathPrefix}.country`);
    const parentAddressZipcode = watch(`${pathPrefix}.zipcode`);

    const [isParentAddrLoading, setIsParentAddrLoading] = useState(false);
    const [parentAddrError, setParentAddrError] = useState<string | null>(null);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Ref to track if a fetch is currently active for the *specific inputs*
    const activeFetchIdentifier = useRef<string | null>(null);

    // --- Parent Address Auto-Fetch Logic (not Guardian) ---

    // Fetch address details (state/city) for parent address based on country and zipcode
    const fetchParentAddressDetails = useCallback(
        async (countryISO2: string, zipcode: string) => {
            const currentFetchId = `${countryISO2}-${zipcode}`;
            activeFetchIdentifier.current = currentFetchId;
            setIsParentAddrLoading(true);
            setParentAddrError(null);

            const apiUrl = `https://cdi-gateway.isha.in/contactinfovalidation/api/countries/${countryISO2}/pincodes/${zipcode}`;
            const rhfStateField = `${pathPrefix}.state`;
            const rhfCityField = `${pathPrefix}.city`;

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
                    setParentAddrError("State not found or invalid data structure from address API.");
                    trigger([rhfStateField as any, rhfCityField as any]);
                }
            } catch (error: any) {
                if (activeFetchIdentifier.current === currentFetchId) {
                    setValue(rhfStateField as any, "", { shouldValidate: true });
                    setValue(rhfCityField as any, "", { shouldValidate: true });
                    setParentAddrError(error.message || "Failed to fetch address details.");
                    trigger([rhfStateField as any, rhfCityField as any]);
                }
            } finally {
                if (activeFetchIdentifier.current === currentFetchId) {
                    setIsParentAddrLoading(false);
                    activeFetchIdentifier.current = null;
                }
            }
        },
        [setValue, pathPrefix, trigger]
    );

    // Effect: When address same as applicant toggles, copy or clear fields
    useEffect(() => {
        const fieldsToTrigger: Path<AdmissionRegistrationFormDataYup>[] = [
            `${pathPrefix}.country` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.zipcode` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.state` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.city` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.address_line1` as Path<AdmissionRegistrationFormDataYup>,
            `${pathPrefix}.address_line2` as Path<AdmissionRegistrationFormDataYup>,
        ];

        if (watchIsAddressSame === 'Yes') {
            // Copy applicant's communication address fields
            setValue(`${pathPrefix}.country`, getValues("country"), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.zipcode`, getValues("zipcode"), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.state`, getValues("state"), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.city`, getValues("city"), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.address_line_1`, getValues("address_line_1"), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue(`${pathPrefix}.address_line_2`, getValues("address_line_2") || "", { shouldValidate: true, shouldDirty: true, shouldTouch: true });

            setParentAddrError(null);
            setIsParentAddrLoading(false);
            activeFetchIdentifier.current = null;
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            trigger(fieldsToTrigger);
        } else if (watchIsAddressSame === 'No') {
            // Optionally clear state/city if switching to 'No'
            setValue(`${pathPrefix}.state`, "", { shouldValidate: true });
            setValue(`${pathPrefix}.city`, "", { shouldValidate: true });
            setParentAddrError(null);
            trigger(fieldsToTrigger);
        }
    }, [watchIsAddressSame, getValues, setValue, pathPrefix, trigger]);

    // Effect: Fetch state/city when country or zipcode changes (only if address is NOT same as applicant)
    useEffect(() => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

        if (watchIsAddressSame !== 'No') {
            setValue(`${pathPrefix}.state`, getValues("state") || "", { shouldValidate: watchIsAddressSame === 'Yes' });
            setValue(`${pathPrefix}.city`, getValues("city") || "", { shouldValidate: watchIsAddressSame === 'Yes' });
            setParentAddrError(null);
            setIsParentAddrLoading(false);
            activeFetchIdentifier.current = null;
            return;
        }

        // Only fetch if both country and zipcode are present and zipcode is at least 3 chars
        if (parentAddressCountryName && parentAddressZipcode && parentAddressZipcode.length >= 3) {
            const currentFetchId = `${parentAddressCountryName}-${parentAddressZipcode}`;
            if (activeFetchIdentifier.current === currentFetchId && isParentAddrLoading) return;
            if (activeFetchIdentifier.current && activeFetchIdentifier.current !== currentFetchId) activeFetchIdentifier.current = null;

            const countryObj = countries.all.find(c => c.name === parentAddressCountryName);
            if (countryObj && countryObj.alpha2) {
                const countryISO2 = countryObj.alpha2;
                setParentAddrError(null);

                debounceTimeoutRef.current = setTimeout(() => {
                    if (
                        watchIsAddressSame === 'No' &&
                        getValues(`${pathPrefix}.country`) === parentAddressCountryName &&
                        getValues(`${pathPrefix}.zipcode`) === parentAddressZipcode
                    ) {
                        fetchParentAddressDetails(countryISO2, parentAddressZipcode);
                    }
                }, 800);
            } else {
                setValue(`${pathPrefix}.state`, "" as string, { shouldValidate: false });
                setValue(`${pathPrefix}.city`, "" as string, { shouldValidate: false });
                if (parentAddressCountryName) {
                    setParentAddrError(`Invalid country ('${parentAddressCountryName}') or ISO code not found.`);
                } else {
                    setParentAddrError("Please select a country first.");
                }
                setIsParentAddrLoading(false);
                activeFetchIdentifier.current = null;
            }
        } else {
            setValue(`${pathPrefix}.state`, "" as string, { shouldValidate: false });
            setValue(`${pathPrefix}.city`, "" as string, { shouldValidate: false });

            if (parentAddressCountryName && parentAddressZipcode && parentAddressZipcode.length > 0 && parentAddressZipcode.length < 3) {
                setParentAddrError("PIN / ZIP Code is too short (minimum 3 characters).");
            } else if (!parentAddressCountryName && parentAddressZipcode && parentAddressZipcode.length >= 3) {
                setParentAddrError("Please select a country.");
            } else {
                setParentAddrError(null);
            }
            setIsParentAddrLoading(false);
            activeFetchIdentifier.current = null;
        }

        return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
    }, [
        watchIsAddressSame,
        parentAddressCountryName,
        parentAddressZipcode,
        fetchParentAddressDetails,
        setValue,
        pathPrefix,
        getValues,
    ]);

    return (
        // JSX remains the same as your last provided version
        // Ensure FormDescription for loading and FormMessage for error are correctly placed under PIN / ZIP Code field
        <div className="p-4 border rounded-md space-y-6 bg-slate-50 dark:bg-slate-800/30 shadow-sm">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Parent Details
                </h3>
                {/* {totalParents > 1 && (
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full sm:w-auto"
                        size="sm"
                        onClick={() => removeParent(index)}>
                        Remove Parent {index + 1}
                    </Button>
                )} */}
            </div>

            {/* Basic Information */}
            <div className="pt-3 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.first_name`} render={({ field }) => (<FormItem><FormLabel>First Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="First Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.last_name`} render={({ field }) => (<FormItem><FormLabel>Last Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Last Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.relation`} render={({ field }) => (
                        <FormItem><FormLabel>Relation<span className="text-destructive"> *</span></FormLabel>
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
                                value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Relation" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_RELATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.nationality`} render={({ field }) => (
                        <FormItem><FormLabel>Nationality<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.nationality`); }}
                                placeholder="Select Nationality" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.country_of_residence`} render={({ field }) => (
                        <FormItem><FormLabel>Country of Residence<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <CountryDropdown
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(country?: Country) => { field.onChange(country?.name || ""); trigger(`${pathPrefix}.country_of_residence`); }}
                                placeholder="Select Country of Residence" />
                        </FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Contact Information */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                    <FormField control={control} name={`${pathPrefix}.contact_email`} render={({ field }) => (<FormItem><FormLabel>Contact Email Address<span className="text-destructive"> *</span></FormLabel><FormControl><Input type="email" placeholder="Email Address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.contact_phone`} render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                            <PhoneInput
                                placeholder="Enter phone number" {...field} onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.contact_phone`); }} value={field.value ?? ''} />
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
                    {watchIsWhatsappSame === false && (
                        <FormField control={control} name={`${pathPrefix}.whatsapp_phone`} render={({ field }) => (
                            <FormItem className="lg:col-start-2"><FormLabel>WhatsApp Number<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <PhoneInput
                                    placeholder="Enter WhatsApp number" {...field} onChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.whatsapp_phone`); }} value={field.value ?? ''} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                </div>
            </div>

            {/* Parent Address Toggle */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Parent Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.is_address_same_as_applicant`} render={({ field }) => (
                        <FormItem><FormLabel>Address same as Applicant's Communication Address?<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    trigger(`${pathPrefix}.is_address_same_as_applicant`);
                                }}
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        field.onBlur();
                                        trigger(`${pathPrefix}.is_address_same_as_applicant`);
                                    }
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
                        <FormField control={control} name={`${pathPrefix}.country`} render={({ field }) => (
                            <FormItem><FormLabel>Country<span className="text-destructive"> *</span></FormLabel><FormControl>
                                <CountryDropdown
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    onChange={(country?: Country) => {
                                        const countryName = country?.name || "";
                                        field.onChange(countryName);
                                        trigger(`${pathPrefix}.country`);
                                        setValue(`${pathPrefix}.zipcode` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false }); // Clear zip on country change
                                        setValue(`${pathPrefix}.state` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setValue(`${pathPrefix}.city` as keyof AdmissionRegistrationFormDataYup, "", { shouldValidate: false });
                                        setParentAddrError(null);
                                    }}
                                    placeholder="Select Country"
                                />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`${pathPrefix}.zipcode`} render={({ field }) => (
                            <FormItem><FormLabel>PIN / ZIP Code<span className="text-destructive"> *</span></FormLabel>
                                <FormControl><Input placeholder="PIN / ZIP Code" {...field} value={field.value ?? ''} disabled={!parentAddressCountryName} /></FormControl>
                                {isParentAddrLoading && <FormDescription>Loading address...</FormDescription>}
                                {parentAddrError && <FormMessage>{parentAddrError}</FormMessage>}
                                {!parentAddrError && !isParentAddrLoading && <FormMessage />} {/* RHF error */}
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
                                    {isParentAddrLoading && !field.value && <FormDescription>Loading state...</FormDescription>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Parent City (Enabled Text Input) */}
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
                                            disabled={isParentAddrLoading && !field.value} // Optionally disable while loading if empty
                                        />
                                    </FormControl>
                                    {isParentAddrLoading && !field.value && <FormDescription>Loading city...</FormDescription>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={control} name={`${pathPrefix}.address_line1`} render={({ field }) => (<FormItem><FormLabel>Address Line 1<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Address Line 1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={control} name={`${pathPrefix}.address_line2`} render={({ field }) => (<FormItem><FormLabel>Address Line 2<span className="text-destructive"></span></FormLabel><FormControl><Input placeholder="Address Line 2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}

            {/* Educational Information */}
            <div className="pt-3 mt-4 border-t border-dashed">
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

            {/* Professional Information */}
            <div className="pt-3 mt-4 border-t border-dashed">
                <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <FormField control={control} name={`${pathPrefix}.profession`} render={({ field }) => (
                        <FormItem><FormLabel>Profession<span className="text-destructive"> *</span></FormLabel>
                            <Select
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) {
                                        field.onBlur();
                                        trigger(`${pathPrefix}.profession`);
                                    }
                                }}
                                onValueChange={(value) => { field.onChange(value); trigger(`${pathPrefix}.profession`); }} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Profession" /></SelectTrigger></FormControl>
                                <SelectContent>{PARENT_PROFESSION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`${pathPrefix}.organization_name`} render={({ field }) => (<FormItem><FormLabel>Organization Name<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Organization Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.designation`} render={({ field }) => (<FormItem><FormLabel>Designation<span className="text-destructive"> *</span></FormLabel><FormControl><Input placeholder="Designation" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`${pathPrefix}.annual_income`} render={({ field }) => (
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