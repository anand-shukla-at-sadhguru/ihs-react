// src/components/forms/admission/LanguagesKnownSection.tsx
import React from 'react';
import { Control, useFormContext, useFieldArray, FieldArrayWithId } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // If you plan to use 'other_language_name'
import type { AdmissionRegistrationFormData, IndividualLanguageData } from './admissionRegistrationSchema'; // Adjust path as needed

// Define these constants here or pass them as props if they might vary
export const LANGUAGE_OPTIONS = ['English', 'Tamil', 'Hindi', 'French', 'German', 'Spanish', 'Arabic', 'Mandarin', 'Japanese', 'Other'] as const;
export const PROFICIENCY_OPTIONS = ['Native', 'Advanced', 'Intermediate', 'Basic'] as const;

interface LanguagesKnownSectionProps {
    control: Control<AdmissionRegistrationFormData>; // Or any if you prefer less strict typing initially
    // We might not need the full form object if we pass fieldArray-specific functions
}

export const LanguagesKnownSection: React.FC<LanguagesKnownSectionProps> = ({ control }) => {
    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
        control,
        name: "languages_known"
    });

    const { watch } = useFormContext<AdmissionRegistrationFormData>(); // To watch for 'Other' language if needed

    return (
        <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
            <h3 className="font-medium text-md mb-3">Languages Known</h3>
            <div className="space-y-4">
                {languageFields.map((item: FieldArrayWithId<AdmissionRegistrationFormData, "languages_known", "id">, index: number) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-3 border rounded-md">
                        <div className="flex-1 w-full sm:w-auto">
                            <FormField
                                control={control}
                                name={`languages_known.${index}.language`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language<span className="text-destructive"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {LANGUAGE_OPTIONS.map(lang => (
                                                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <FormField
                                control={control}
                                name={`languages_known.${index}.proficiency`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proficiency<span className="text-destructive"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Proficiency" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {PROFICIENCY_OPTIONS.map(level => (
                                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Optional: Field for 'Other' language specification */}
                        {watch(`languages_known.${index}.language` as const) === 'Other' && ( // Use watch from useFormContext
                            <div className="flex-1 w-full sm:w-auto">
                                <FormField
                                    control={control}
                                    // Make sure 'other_language_name' is in your individualLanguageSchema if you uncomment this
                                    // name={`languages_known.${index}.other_language_name`} 
                                    name={`languages_known.${index}.language`} // Placeholder if other_language_name is not in schema
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specify Other Language<span className="text-destructive"> *</span></FormLabel>
                                            <FormControl><Input placeholder="Language name" {...field} value={field.value ?? ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                            {languageFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full sm:w-auto"
                                    size="sm"
                                    onClick={() => removeLanguage(index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLanguage({
                        language: LANGUAGE_OPTIONS[0], // Default values for new row
                        proficiency: PROFICIENCY_OPTIONS[3], // Default to 'Basic'
                        // other_language_name: '' // if using this field
                    } as unknown as IndividualLanguageData)} // Type assertion might be needed depending on strictness
                    className="mt-2"
                >
                    Add Language
                </Button>
            </div>
        </div>
    );
};