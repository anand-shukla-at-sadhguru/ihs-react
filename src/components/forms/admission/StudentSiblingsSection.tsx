// src/components/forms/admission/StudentSiblingsSection.tsx
import React from 'react';
import { Control, UseFieldArrayAppend, UseFieldArrayRemove, FieldArrayWithId } from 'react-hook-form'; // Update imports
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
import type { AdmissionRegistrationFormData, IndividualSiblingData } from './admissionRegistrationSchema'; // Adjust path

// Constants for dropdowns
const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

interface StudentSiblingsSectionProps {
    control: Control<AdmissionRegistrationFormData>;
    fields: FieldArrayWithId<AdmissionRegistrationFormData, "student_siblings", "id">[]; // Pass fields
    append: UseFieldArrayAppend<AdmissionRegistrationFormData, "student_siblings">;    // Pass append
    remove: UseFieldArrayRemove;                                                         // Pass remove
}

export const StudentSiblingsSection: React.FC<StudentSiblingsSectionProps> = ({
    control,
    fields,
    append,
    remove
}) => {
    // useFieldArray is no longer called here

    return (
        <div className="md:col-span-2 lg:col-span-3">
            <div className="space-y-4">
                {fields.map((item, index) => ( // Use the passed 'fields'
                    <div key={item.id} className="p-4 border rounded-md space-y-3 relative">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold">Sibling {index + 1}</h4>
                            {/* Show remove button for any item, as min 1 is handled by schema & auto-append */}
                            {index >= 1 && <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(index)} // Use passed 'remove'
                                className="w-full sm:w-auto"
                            >
                                Remove Sibling
                            </Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            <FormField
                                control={control}
                                name={`student_siblings.${index}.sibling_first_name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl><Input placeholder="First Name" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`student_siblings.${index}.sibling_last_name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl><Input placeholder="Last Name" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`student_siblings.${index}.sibling_roll_number`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Roll Number<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl><Input placeholder="Roll Number" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`student_siblings.${index}.sibling_date_of_birth`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth<span className="text-destructive"> *</span></FormLabel>
                                        <FormControl><Input type="date" placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`student_siblings.${index}.sibling_gender`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender<span className="text-destructive"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {GENDER_OPTIONS.map(gender => (
                                                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                    onClick={() => append({ // Use passed 'append'
                        sibling_first_name: '',
                        sibling_last_name: '',
                        sibling_roll_number: '',
                        sibling_date_of_birth: '',
                        sibling_gender: ''
                    } as unknown as IndividualSiblingData)}
                    className="mt-2"
                >
                    Add Sibling
                </Button>
            </div>
        </div>
    );
};