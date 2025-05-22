// src/components/forms/admission/PreviousSchoolsSection.tsx
import React from 'react';
import { Control, useFormContext, UseFieldArrayAppend, UseFieldArrayRemove, FieldArrayWithId } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
    FormControl,
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
import { CountryDropdown } from "@/components/ui/country-dropdown"; // Ensure this is your custom component
import { Eye } from 'lucide-react';

// Import Yup-specific types and constants
import {
    BOARD_OPTIONS_YUP,      // Assuming you have this defined for Yup
    CLASS_LEVEL_OPTIONS_YUP,// Assuming you have this defined for Yup
    Country // This can remain if your CountryDropdown uses it
} from "./admissionFormTabUtils"; // Or from where Yup constants are defined

// Import the main Yup form data type and the individual item type from your Yup schema file
import type {
    AdmissionRegistrationFormDataYup,
    IndividualPreviousSchoolDataYup
} from "./yupSchema"; // ADJUST PATH TO YOUR YUP SCHEMA FILE

const currentYearForInput = new Date().getFullYear();

interface PreviousSchoolsSectionProps {
    control: Control<AdmissionRegistrationFormDataYup>;
    fields: FieldArrayWithId<AdmissionRegistrationFormDataYup, "previous_schools", "id">[]; // This is correct and receives `schoolFields` from parent
    append: UseFieldArrayAppend<AdmissionRegistrationFormDataYup, "previous_schools">;
    remove: UseFieldArrayRemove;
    handlePreviewFile: (file: File | null | undefined) => void;
}

export const PreviousSchoolsSection: React.FC<PreviousSchoolsSectionProps> = ({
    control,
    fields,
    append,
    remove,
    handlePreviewFile,
    // schoolFields,
}) => {
    const { trigger, getFieldState } = useFormContext<AdmissionRegistrationFormDataYup>();
    console.log(fields, "WHY")
    return (
        <div className="md:col-span-2 lg:col-span-3 pt-0 mt-0">
            <h3 className="font-medium text-md mb-4">Previous School Details</h3>
            <div className="space-y-6">
                {fields.map((item, index) => {
                    const basePath = `previous_schools.${index}` as const;
                    return (
                        <div key={item.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/30 shadow-sm">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b">
                                <h4 className="text-base font-semibold text-primary"></h4>
                                {/* Allow removing any school, schema should enforce min 1 if 'been_to_school_previously' is Yes */}
                                {fields.length > 1 && <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => remove(index)}
                                >
                                    Remove School
                                </Button>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>School Name<span className="text-destructive"> *</span></FormLabel>
                                            <FormControl><Input placeholder="Enter School Name" {...field} value={field.value || ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_board_affiliation`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Board Affiliation<span className="text-destructive"> *</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => { field.onChange(value); trigger(`${basePath}.prev_school_board_affiliation`); }}
                                                value={field.value || ''}
                                                onOpenChange={(isOpen) => { if (!isOpen && getFieldState(`${basePath}.prev_school_board_affiliation`).isTouched) trigger(`${basePath}.prev_school_board_affiliation`); }}
                                            >
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {BOARD_OPTIONS_YUP.map(board => ( // Use Yup constant
                                                        <SelectItem key={board} value={board}>{board}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_from_year`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Year (YYYY)<span className="text-destructive"> *</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="YYYY"
                                                    min={1980} // Or a more appropriate minimum
                                                    max={currentYearForInput}
                                                    step={1}
                                                    {...field}
                                                    value={field.value ?? ''} // RHF handles number value
                                                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                                    onBlur={() => { field.onBlur(); if (getFieldState(`${basePath}.prev_school_from_year`).isTouched) trigger(`${basePath}.prev_school_from_year`); }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_to_year`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>To Year (YYYY)<span className="text-destructive"> *</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="YYYY"
                                                    min={1980}
                                                    max={currentYearForInput}
                                                    step={1}
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                                    onBlur={() => { field.onBlur(); if (getFieldState(`${basePath}.prev_school_to_year`).isTouched) trigger(`${basePath}.prev_school_to_year`); }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_from_class`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Class<span className="text-destructive"> *</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => { field.onChange(value); trigger(`${basePath}.prev_school_from_class`); }}
                                                value={field.value || ''}
                                                onOpenChange={(isOpen) => { if (!isOpen && getFieldState(`${basePath}.prev_school_from_class`).isTouched) trigger(`${basePath}.prev_school_from_class`); }}
                                            >
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {CLASS_LEVEL_OPTIONS_YUP.map(cls => ( // Use Yup constant
                                                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_to_class`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>To Class<span className="text-destructive"> *</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => { field.onChange(value); trigger(`${basePath}.prev_school_to_class`); }}
                                                value={field.value || ''}
                                                onOpenChange={(isOpen) => { if (!isOpen && getFieldState(`${basePath}.prev_school_to_class`).isTouched) trigger(`${basePath}.prev_school_to_class`); }}
                                            >
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {CLASS_LEVEL_OPTIONS_YUP.map(cls => ( // Use Yup constant
                                                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_country`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country<span className="text-destructive"> *</span></FormLabel>
                                            <FormControl>
                                                <CountryDropdown
                                                    value={field.value} // field.value should be string (country name)
                                                    onChange={(country?: Country) => {
                                                        field.onChange(country?.name || "");
                                                        trigger(`${basePath}.prev_school_country`);
                                                    }}
                                                    onBlur={() => { field.onBlur(); if (getFieldState(`${basePath}.prev_school_country`).isTouched) trigger(`${basePath}.prev_school_country`); }}
                                                    placeholder="Select country"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_zip_code`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PIN / ZIP Code<span className="text-destructive"> *</span></FormLabel>
                                            <FormControl><Input placeholder="Enter PIN / ZIP Code" {...field} value={field.value || ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${basePath}.prev_school_report_card`}
                                    render={({ field: { onChange: onFileChange, value: fileValue, ref, ...restFileField } }) => ( // Destructure ref
                                        <FormItem>
                                            <FormLabel>Report Card<span className="text-destructive"> *</span></FormLabel>
                                            <div className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        className='pt-1.5 flex-grow'
                                                        accept="application/pdf,image/jpeg,image/png"
                                                        ref={ref} // Assign ref
                                                        // name, onBlur are in restFileField
                                                        onChange={(e) => {
                                                            const file = e.target.files ? e.target.files[0] : null;
                                                            onFileChange(file); // RHF's onChange for files
                                                            trigger(`${basePath}.prev_school_report_card`);
                                                        }}
                                                        {...restFileField}
                                                    />
                                                </FormControl>
                                                {fileValue && fileValue instanceof File && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost" size="icon" // Adjusted for icon button
                                                        onClick={() => handlePreviewFile(fileValue)}
                                                        aria-label="Preview report card"
                                                        title="Preview report card"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    );
                })}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                        // Defaults must align with IndividualPreviousSchoolDataYup
                        prev_school_name: '',
                        prev_school_board_affiliation: undefined, // Or BOARD_OPTIONS_YUP[0] if you want a default selected
                        prev_school_from_year: undefined, // Yup number can be undefined
                        prev_school_to_year: undefined,
                        prev_school_from_class: undefined, // Or CLASS_LEVEL_OPTIONS_YUP[0]
                        prev_school_to_class: undefined,
                        prev_school_country: undefined, // Default to undefined for placeholder
                        prev_school_zip_code: '',
                        prev_school_report_card: undefined, // For file, undefined or null
                    } as unknown as IndividualPreviousSchoolDataYup)} // Cast to your Yup type
                    className="mt-4"
                >
                    Add Previous School
                </Button>
            </div>
        </div>
    );
};