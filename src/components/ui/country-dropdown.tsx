// CountryDropdown.tsx (or wherever this component is defined)

import { useCallback, useState, forwardRef, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckIcon, Globe } from "lucide-react";
import { CircleFlag } from "react-circle-flags";
import { countries } from "country-data-list";

export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

interface CountryDropdownProps {
  options?: Country[];
  onChange?: (country?: Country) => void; // Allow undefined if placeholder is selected
  onBlur?: () => void; // <-- ADD onBlur to the props
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
  name?: string; // react-hook-form passes name, good to include
}

const CountryDropdownComponent = forwardRef<HTMLButtonElement, CountryDropdownProps>(
  (
    {
      options = countries.all.filter(
        (country: Country) =>
          country.emoji && country.status !== "deleted" && country.ioc !== "PRK"
      ),
      onChange,
      onBlur, // <-- DESTRUCTURE onBlur from props
      value,
      defaultValue,
      disabled = false,
      placeholder = "Select a country",
      slim = false,
      ...props // This will now contain field.onBlur if passed from FormField
    }: CountryDropdownProps,
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
      undefined
    );

    useEffect(() => {
      let countryToSet: Country | undefined = undefined;
      if (value) {
        countryToSet = options.find((country) => country.name === value);
      } else if (defaultValue && !value) { // Only use defaultValue if value is not present
        countryToSet = options.find((country) => country.alpha3 === defaultValue);
      }
      setSelectedCountry(countryToSet);
    }, [value, defaultValue, options]);

    const handleSelect = useCallback(
      (country: Country | undefined) => { // Allow undefined for deselect/placeholder
        setSelectedCountry(country);
        onChange?.(country); // Pass the full country object or undefined
        setOpen(false);
        // Manually trigger onBlur after selection because Popover might steal focus
        // or the button itself might not naturally blur in a way RHF expects.
        onBlur?.(); // <-- CALL onBlur here
      },
      [onChange, onBlur] // Add onBlur to dependency array
    );

    const triggerClasses = cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      slim === true && "w-20"
    );

    const displayPlaceholder = slim === false ? placeholder : <Globe size={20} />;

    return (
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        // If closing the popover and it was triggered by user interaction (not a selection),
        // then it's a blur event for the component.
        if (!isOpen) {
          onBlur?.(); // <-- CALL onBlur when Popover closes without a selection
        }
      }}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            className={triggerClasses}
            disabled={disabled}
            // {...props} // Spread remaining props, which might include onBlur from RHF
            // Explicitly calling props.onBlur (which is field.onBlur from RHF) is more direct
            onBlur={onBlur} // <-- ATTACH RHF's onBlur (passed via props) to the button
            {...props} // Keep spreading other props like name, etc.
          >
            {selectedCountry ? (
              <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
                <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                  <CircleFlag
                    countryCode={selectedCountry.alpha2.toLowerCase()}
                    height={20}
                  />
                </div>
                {slim === false && (
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {selectedCountry.name}
                  </span>
                )}
              </div>
            ) : (
              <span className={value ? "text-foreground" : "text-muted-foreground"}> {/* Style placeholder */}
                {displayPlaceholder}
              </span>
            )}
            <ChevronDown size={16} className="ml-auto shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={10}
          side="bottom"
          className="min-w-[--radix-popper-anchor-width] p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }} // Ensure content width matches trigger
          onCloseAutoFocus={(e) => e.preventDefault()} // Prevents focus shift on close that might re-trigger blur too soon
        >
          <Command className="w-full max-h-[200px] sm:max-h-[270px]">
            <CommandList>
              <div className="sticky top-0 z-10 bg-popover">
                <CommandInput placeholder="Search country..." />
              </div>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.name)
                  .map((option) => ( // Removed 'key' prop, CommandItem uses value
                    <CommandItem
                      className="flex items-center w-full gap-2"
                      key={option.alpha2} // Use a unique country identifier like alpha2
                      value={option.name}
                      onSelect={() => {
                        handleSelect(option);
                      }}
                    >
                      <div className="flex flex-grow w-0 space-x-2 overflow-hidden">
                        <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                          <CircleFlag
                            countryCode={option.alpha2.toLowerCase()}
                            height={20}
                          />
                        </div>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {option.name}
                        </span>
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          option.name === selectedCountry?.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

CountryDropdownComponent.displayName = "CountryDropdownComponent";
export const CountryDropdown = CountryDropdownComponent; // If you are not using forwardRef directly anymore or if it was just for the component variable
// If you were using forwardRef:
// export const CountryDropdown = forwardRef(CountryDropdownComponent);