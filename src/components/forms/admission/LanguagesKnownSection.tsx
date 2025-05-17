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
import type { AdmissionRegistrationFormData, IndividualLanguageData } from './admissionRegistrationSchema'; // Adjust path as needed
import { LANGUAGE_OPTIONS, PROFICIENCY_OPTIONS } from './admissionFormTabUtils';

interface LanguagesKnownSectionProps {
    control: Control<AdmissionRegistrationFormData>;
}

export const LanguagesKnownSection: React.FC<LanguagesKnownSectionProps> = ({ control }) => {
    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
        control,
        name: "languages_known"
    });

    // Get trigger and getFieldState from useFormContext if you need to implement onBlur validation for these selects
    const { watch, trigger, getFieldState } = useFormContext<AdmissionRegistrationFormData>();

    return (
        <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
            <h3 className="font-medium text-md mb-3">Languages Known</h3>
            <div className="space-y-4">
                {languageFields.map((item: FieldArrayWithId<AdmissionRegistrationFormData, "languages_known", "id">, index: number) => {
                    const languageFieldName = `languages_known.${index}.language` as const;
                    const proficiencyFieldName = `languages_known.${index}.proficiency` as const;
                    // const otherLanguageFieldName = `languages_known.${index}.other_language_name` as const; // If you add this field to schema

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
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''} // Ensure value is empty string if null/undefined for placeholder
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
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''} // Ensure value is empty string if null/undefined for placeholder
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
                            {watch(languageFieldName) === 'Other' && (
                                <div className="flex-1 w-full sm:w-auto">
                                    <FormField
                                        control={control}
                                        // IMPORTANT: If you want to store the "Other" language name separately,
                                        // you MUST add 'other_language_name: z.string().optional()' to your
                                        // 'individualLanguageSchema' in 'admissionRegistrationSchema.ts'.
                                        // And then use that field name here.
                                        // For now, this example assumes you might overwrite the 'language' field,
                                        // which is generally NOT recommended if 'language' is an enum.
                                        // It's better to have a dedicated 'other_language_name' field.
                                        // name={otherLanguageFieldName} // << Preferred if schema has it
                                        name={`languages_known.${index}.language`} // << TEMPORARY: Reuses language field. NOT IDEAL.
                                        // Zod will complain if this value isn't in the enum.
                                        // You should ideally use a new field like `other_language_spec`
                                        // and make it conditionally required in your schema.
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specify Other Language<span className="text-destructive"> *</span></FormLabel>
                                                <FormControl><Input
                                                    placeholder="Language name"
                                                    {...field}
                                                    // If reusing 'language' field, this onChange might need care to not break enum
                                                    value={''} // Always empty when displayed
                                                    onChange={(e) => {
                                                        // If using a dedicated field, just field.onChange(e.target.value)
                                                        // If reusing `language`, this is tricky. Best to use a separate field.
                                                        field.onChange(e.target.value);
                                                    }}
                                                /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            <div className="w-full sm:w-auto mt-2 sm:mt-0 self-end pb-[2px]"> {/* Adjusted alignment for button */}
                                {/* Show remove button only if it's not the first item AND there's more than one item.
                                    Your schema requires min(1) for languages_known, so we can always allow removal
                                    if length > 1, and ensure the first one is never removed if it's the only one.
                                    The schema min(1) will show an error if all are removed.
                                */}
                                {index >= 1 && ( // Only show if more than 1 item exists
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
                        language: '' as any, // Start with empty string to show placeholder
                        proficiency: '' as any, // Start with empty string
                        // other_language_name: '' // if using this field and it's in schema
                    } as IndividualLanguageData)} // Type assertion
                    className="mt-2"
                >
                    Add Language
                </Button>
            </div>
        </div>
    );
};