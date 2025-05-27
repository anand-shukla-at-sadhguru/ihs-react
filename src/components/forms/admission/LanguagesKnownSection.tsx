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
import { Input } from "@/components/ui/input";
// Ensure this path and types are correct for your Yup setup
import type { AdmissionRegistrationFormDataYup, IndividualLanguageDataYup } from './yupSchema'; // ADJUST PATH AND TYPE NAME
import { LANGUAGE_OPTIONS, PROFICIENCY_OPTIONS } from './admissionFormTabUtils';

interface LanguagesKnownSectionProps {
    // Use the Yup inferred type for the main form data
    control: Control<AdmissionRegistrationFormDataYup>;
}

export const LanguagesKnownSection: React.FC<LanguagesKnownSectionProps> = ({ control }) => {
    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
        control,
        name: "student_languages"
    });

    const { watch, trigger, getFieldState, setValue } = useFormContext<AdmissionRegistrationFormDataYup>();

    return (
        <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
            <h3 className="font-medium text-md mb-3">Languages Known</h3>
            <div className="space-y-4">
                {languageFields.map((item: FieldArrayWithId<AdmissionRegistrationFormDataYup, "student_languages", "id">, index: number) => {
                    const languageFieldName = `student_languages.${index}.language` as const;
                    const proficiencyFieldName = `student_languages.${index}.proficiency` as const;
                    const otherLanguageFieldName = `student_languages.${index}.other_language` as const; // Correct field name

                    const currentLanguageValue = watch(languageFieldName); // Watch the current language selection

                    return (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-3 border rounded-md">
                            <div className="flex-1 w-full sm:w-auto">
                                <FormField
                                    control={control}
                                    name={languageFieldName}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Language<span className="text-destructive"> *</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    // If switching away from 'Other', clear the other_language field
                                                    if (value !== 'Other') {
                                                        setValue(otherLanguageFieldName, undefined, { shouldValidate: true });
                                                    }
                                                    trigger(languageFieldName); // Trigger validation for the language field itself
                                                    if (value === 'Other') { // Optionally trigger other_language when 'Other' is selected
                                                        trigger(otherLanguageFieldName);
                                                    }
                                                }}
                                                value={field.value ?? ''}
                                                onOpenChange={(isOpen) => {
                                                    if (!isOpen) {
                                                        field.onBlur();
                                                        if (getFieldState(languageFieldName).isTouched) {
                                                            trigger(languageFieldName);
                                                        }
                                                    }
                                                }}
                                            >
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
                                    name={proficiencyFieldName}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proficiency<span className="text-destructive"> *</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    trigger(proficiencyFieldName);
                                                }}
                                                value={field.value ?? ''}
                                                onOpenChange={(isOpen) => {
                                                    if (!isOpen) {
                                                        field.onBlur();
                                                        if (getFieldState(proficiencyFieldName).isTouched) {
                                                            trigger(proficiencyFieldName);
                                                        }
                                                    }
                                                }}
                                            >
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

                            {/* Conditionally render the "Specify Other Language" field */}
                            {typeof currentLanguageValue === 'string' && currentLanguageValue === 'Other' && (
                                <div className="flex-1 w-full sm:w-auto">
                                    <FormField
                                        control={control}
                                        name={otherLanguageFieldName} // *** USE THE CORRECT FIELD NAME ***
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specify Other Language<span className="text-destructive"> *</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter language name"
                                                        {...field} // This handles value and onChange correctly for this field
                                                        onBlur={() => { // Trigger validation on blur
                                                            field.onBlur();
                                                            if (getFieldState(otherLanguageFieldName).isTouched) {
                                                                trigger(otherLanguageFieldName);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage /> {/* This will show Yup validation errors for other_language */}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            <div className="w-full sm:w-auto mt-2 sm:mt-0 self-end pb-[2px]">
                                {languageFields.length > 1 && ( // Allow removing if more than one language entry
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
                    );
                })}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLanguage({
                        language: undefined,     // Default to undefined for Yup optional/required strings
                        proficiency: undefined,  // Default to undefined
                        other_language: undefined // Default to undefined
                    } as unknown as IndividualLanguageDataYup)} // Ensure type matches Yup
                    className="mt-2"
                >
                    Add Language
                </Button>
            </div>
        </div>
    );
};