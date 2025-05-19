import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

export default function OrientationPage() {
    // Predefined slots (customize as needed)
    const slots = [
        "Saturday, 15 June 2024, 10:00 AM - 12:00 PM",
        "Sunday, 16 June 2024, 2:00 PM - 4:00 PM",
        "Wednesday, 19 June 2024, 9:30 AM - 11:30 AM",
        "Saturday, 22 June 2024, 10:00 AM - 12:00 PM"
    ];
    const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        // Simulate redirect to GPMS (replace with actual URL as needed)
        setTimeout(() => {
            window.location.href = "https://gpms.in/payment"; // Replace with actual GPMS payment URL
        }, 1000);
    };

    return (
        // Add padding to the container of the card for better page layout
        <div className="min-h-screen bg-background sm:px-6 lg:px-8 flex items-center justify-center">
            <Card className="w-full mx-autol"> {/* Added max-width and shadow */}
                <CardHeader className="border-b pb-6"> {/* Added border for separation */}
                    <CardTitle className="text-3xl font-bold text-center text-primary"> {/* Enhanced title */}
                        Orientation Program
                    </CardTitle>
                    <p className="text-muted-foreground text-center mt-2">
                        Welcome! Please review the essential information below to get started.
                    </p>
                </CardHeader>
                <CardContent className="pt-8"> {/* Increased top padding for content */}
                    <div className="flex flex-col gap-10 md:gap-12"> {/* Adjusted gap */}
                        <h2 className="text-xl md:text-2xl font-semibold text-center text-foreground mb-4"> {/* Enhanced heading */}
                            Please watch the following orientation videos before proceeding:
                        </h2>

                        {/* Video 1 Section */}
                        <div className="space-y-3">
                            <h3 className="text-lg md:text-xl font-semibold text-center md:text-left text-foreground">
                                Parent Orientation
                            </h3>
                            <div className="w-full md:w-5/6 lg:w-4/5 mx-auto flex flex-col items-center justify-center bg-muted border-2 border-primary/20 rounded-xl shadow-lg py-8">
                                <a
                                    href="https://www.youtube.com/watch?v=FxkFiyVdCdU"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                                >
                                    Watch Parent Orientation Video
                                </a>
                            </div>
                        </div>

                        {/* Video 2 Section */}
                        <div className="space-y-3">
                            <h3 className="text-lg md:text-xl font-semibold text-center md:text-left text-foreground"> {/* Enhanced video title */}
                                Sadhguru on Home School
                            </h3>
                            <div className="aspect-video rounded-xl overflow-hidden border-2 border-primary/20 bg-muted shadow-lg w-full md:w-5/6 lg:w-4/5 mx-auto"> {/* Enhanced styling, responsive width */}
                                <iframe
                                    src="https://www.youtube.com/embed/GtgVKnIyJl4"
                                    title="Sadhguru on Home School Video" // More descriptive title
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full"
                                    loading="lazy" // Lazy load iframe
                                />
                            </div>
                        </div>

                        <div className="mt-8 space-y-6 ">
                            <div className="text-center">
                                <label className="block font-semibold mb-2 text-center text-lg">
                                    Choose your preferred date for the in-person Orientation process
                                </label>
                                <Select
                                    value={selectedSlot}
                                    onValueChange={setSelectedSlot}
                                    disabled={submitted}
                                >
                                    <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 mx-auto">
                                        <SelectValue placeholder="Select a slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {slots.map((slot) => (
                                            <SelectItem key={slot} value={slot}>
                                                {slot}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-center text-lg font-medium">
                                Application Stage II fee: <span className="font-bold text-primary">₹4000/-</span>
                            </div>
                            <div className="text-center">
                                <Button
                                    size="lg"
                                    className="w-full md:w-2/3 lg:w-1/2"
                                    disabled={!selectedSlot || submitted}
                                    onClick={handleSubmit}
                                >
                                    {submitted ? "Redirecting..." : "Submit & Pay"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}