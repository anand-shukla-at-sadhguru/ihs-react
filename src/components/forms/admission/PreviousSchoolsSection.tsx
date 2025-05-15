// src/components/forms/admission/PreviousSchoolsSection.tsx
import React from 'react';
import { Control, UseFieldArrayAppend, UseFieldArrayRemove, FieldArrayWithId } from 'react-hook-form';
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
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { Eye } from 'lucide-react';
import type { AdmissionRegistrationFormData, IndividualPreviousSchoolData } from './admissionRegistrationSchema'; // Adjust path as needed
import type { Country } from './AdmissionRegistrationForm'; // Assuming Country type is exported from AdmissionRegistrationForm or defined in a shared types file

// Constants for dropdowns (ensure these match your schema definitions if they are enums there)
const BOARD_AFFILIATION_OPTIONS_STRING = "CBSE – Central Board of Secondary Education\nICSE - Indian Certificate of Secondary Education\nSSC - Secondary School Certificate\nIB - International Baccalaureate\nCambridge International\nState Board\nOther";
export const BOARD_AFFILIATION_OPTIONS = BOARD_AFFILIATION_OPTIONS_STRING.split('\n').map(o => o.trim()).filter(o => o.length > 0);

export const CLASS_LEVEL_OPTIONS = ['LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'] as const;
const currentYearForInput = new Date().getFullYear();

interface PreviousSchoolsSectionProps {
    control: Control<AdmissionRegistrationFormData>;
    fields: FieldArrayWithId<AdmissionRegistrationFormData, "previous_schools", "id">[];
    append: UseFieldArrayAppend<AdmissionRegistrationFormData, "previous_schools">;
    remove: UseFieldArrayRemove;
    handlePreviewFile: (file: File | null | undefined) => void;
}

export const PreviousSchoolsSection: React.FC<PreviousSchoolsSectionProps> = ({
    control,
    fields,
    append,
    remove,
    handlePreviewFile
}) => {
    // const { watch } = useFormContext<AdmissionRegistrationFormData>(); // Uncomment if needed for 'Other' board logic

    return (
        // This component will be placed within a grid cell by its parent, so no top-level grid spans here.
        <div className="pt-0 mt-0"> {/* Adjust top padding/margin as needed by the parent's layout */}
            <h3 className="font-medium text-md mb-4">Previous School Details</h3> {/* Added mb-4 for spacing before the first card */}
            <div className="space-y-6">
                {fields.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-md space-y-4 relative bg-slate-50 dark:bg-slate-800/30"> {/* Added some subtle background */}
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-semibold">School {index + 1}</h4>
                            {/* Show remove button if there's more than one school, or if schema min(1) is handled by parent */}
                            {/* For now, allowing removal of any as parent useEffect handles adding the first one if needed */}
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                size="sm"
                                onClick={() => remove(index)}
                            >
                                Remove School
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            {/* School Name */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>School Name<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl><Input placeholder="Enter School Name" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Board Affiliation */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_board_affiliation`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Board Affiliation<span className="text-destructive"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {BOARD_AFFILIATION_OPTIONS.map(board => (
                                                    <SelectItem key={board} value={board}>{board}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* From Year */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_from_year`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Year (YYYY)<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="YYYY"
                                                min={2000}
                                                max={currentYearForInput}
                                                step={1}
                                                {...field}
                                                value={field.value ?? ''} // Handle number input value
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* To Year */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_to_year`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Year (YYYY)<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="YYYY"
                                                min={2000} // Consider dynamically setting min based on from_year
                                                max={currentYearForInput}
                                                step={1}
                                                {...field}
                                                value={field.value ?? ''} // Handle number input value
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* From Class */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_from_class`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Class<span className="text-destructive"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {CLASS_LEVEL_OPTIONS.map(cls => (
                                                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* To Class */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_to_class`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Class<span className="text-destructive"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {CLASS_LEVEL_OPTIONS.map(cls => (
                                                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Country */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_country`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl>
                                            <CountryDropdown
                                                value={field.value} // Assuming field.value is country name string
                                                onChange={(country: Country | undefined) => field.onChange(country?.name || "")}
                                                placeholder="Select country"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Zipcode */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_zip_code`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zipcode<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl><Input placeholder="Enter Zipcode" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Report Card */}
                            <FormField
                                control={control}
                                name={`previous_schools.${index}.prev_school_report_card`}
                                render={({ field: { onChange: onFileChange, value: fileValue, ...restFileField } }) => (
                                    <FormItem>
                                        <FormLabel>Report Card<span className="text-destructive"> *</span></FormLabel>
                                        <div className="flex items-center space-x-2">
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    className='pt-1.5 flex-grow' // Shadcn UI often needs this for file input height
                                                    onChange={(e) => {
                                                        const file = e.target.files ? e.target.files[0] : null;
                                                        onFileChange(file);
                                                    }}
                                                    {...restFileField} // name, onBlur, ref
                                                />
                                            </FormControl>
                                            {fileValue && fileValue instanceof File && (
                                                <Button
                                                    type="button"
                                                    onClick={() => handlePreviewFile(fileValue)}
                                                    className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:hover:bg-muted"
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
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                        prev_school_name: '',
                        prev_school_board_affiliation: BOARD_AFFILIATION_OPTIONS[0] || '', // Default to first board or empty
                        prev_school_from_year: undefined,
                        prev_school_to_year: undefined,
                        prev_school_from_class: CLASS_LEVEL_OPTIONS[0], // Default to first class
                        prev_school_to_class: CLASS_LEVEL_OPTIONS[0],   // Default to first class
                        prev_school_country: 'India', // Default country
                        prev_school_zip_code: '',
                        prev_school_report_card: undefined,
                    } as unknown as IndividualPreviousSchoolData)} // Cast if needed
                    className="mt-2"
                >
                    Add Previous School
                </Button>
            </div>
        </div>
    );
};