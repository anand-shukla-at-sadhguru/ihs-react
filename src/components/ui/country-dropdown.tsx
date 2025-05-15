import React, { useCallback, useState, forwardRef, useEffect } from "react";

// shadcn
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

// utils
import { cn } from "@/lib/utils";

// assets
import { ChevronDown, CheckIcon, Globe } from "lucide-react";
import { CircleFlag } from "react-circle-flags";

// data
import { countries } from "country-data-list";

// Country interface
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

// Dropdown props
interface CountryDropdownProps {
  options?: Country[];
  onChange?: (country: Country) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
}

// CountryDropdown.tsx

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

// Dropdown props
interface CountryDropdownProps {
  options?: Country[];
  onChange?: (country: Country) => void;
  value?: string; // MODIFIED: To accept country name from react-hook-form
  defaultValue?: string; // Keep for initial non-form usage, but `value` will take precedence
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
}

const CountryDropdownComponent = (
  {
    options = countries.all.filter(
      (country: Country) =>
        country.emoji && country.status !== "deleted" && country.ioc !== "PRK"
    ),
    onChange,
    value, // MODIFIED: Destructure the new value prop
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    slim = false,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );

  useEffect(() => {
    let countryToSet: Country | undefined = undefined;
    if (value) {
      // If `value` (country name) is provided, find the country by its name
      countryToSet = options.find(
        (country) => country.name === value
      );
    } else if (defaultValue) {
      // Fallback to defaultValue (alpha3 code) if value is not provided
      countryToSet = options.find(
        (country) => country.alpha3 === defaultValue
      );
    }
    setSelectedCountry(countryToSet);
  }, [value, defaultValue, options]); // MODIFIED: Add `value` to dependency array

  const handleSelect = useCallback(
    (country: Country) => {
      console.log("🌍 CountryDropdown value selected: ", country);
      // No need to call setSelectedCountry here if `value` prop is driving it,
      // but it's fine for immediate visual feedback before RHF update cycle
      setSelectedCountry(country);
      onChange?.(country); // This will trigger field.onChange in FormField
      setOpen(false);
    },
    [onChange]
  );

  const triggerClasses = cn(
    "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    slim === true && "w-20"
  );

  // Placeholder logic adjustment if needed
  const displayPlaceholder = slim === false ? placeholder : <Globe size={20} />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        asChild // Important for custom components with react-hook-form ref
        // className={triggerClasses} // className is now on the child button
        // disabled={disabled} // disabled is now on the child button
        // {...props} // props are now on the child button
      >
        <button // Using a button as the trigger for better accessibility & styling control
          type="button" // Prevent form submission
          className={triggerClasses}
          disabled={disabled}
          {...props}
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
            <span>
              {/* Corrected placeholder display:
                  The original `setSelectedCountry.name` in placeholder logic was an error.
                  If selectedCountry is undefined, show the placeholder.
              */}
              {displayPlaceholder}
            </span>
          )}
          <ChevronDown size={16} className="ml-auto shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-[--radix-popper-anchor-width] p-0"
        // style={{ width: 'var(--radix-popover-trigger-width)' }} // Ensure content width matches trigger
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
                .map((option, key: number) => (
                  <CommandItem
                    className="flex items-center w-full gap-2"
                    key={key} // Using index as key if alpha2/alpha3 isn't globally unique or available before selection for some reason
                    value={option.name} // Important for Command's internal filtering/value
                    onSelect={() => {
                        // onSelect in CommandItem is called with the current input value
                        // if you want to ensure it uses the option object:
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
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";

export const CountryDropdown = forwardRef(CountryDropdownComponent);