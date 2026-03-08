import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAgentActions } from "../hooks/use-agent-actions";

interface UserFormProps {
    title: string;
    fields: {
        name: string;
        label: string;
        type: "text" | "number" | "email" | "select" | "date";
        options?: string[];
    }[];
    submitLabel?: string;
}

export function GenUIUserForm({ title, fields, submitLabel }: UserFormProps) {
    const { callTool } = useAgentActions();
    const [formData, setFormData] = useState<Record<string, any>>({});

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        callTool("onFormSubmit", { title, formData });
    };
    return (
        <Card className="rounded-2xl border-none shadow-lg bg-card">
            <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                {field.label}
                            </Label>
                            {field.type === "select" ? (
                                <select
                                    className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                >
                                    <option value="" disabled>Select {field.label.toLowerCase()}...</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    type={field.type}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className="rounded-xl bg-background/50 h-10 focus:ring-2 focus:ring-primary/20 transition-all border-none ring-1 ring-foreground/10"
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    <Button
                        type="submit"
                        className="w-full h-11 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
                    >
                        {submitLabel || "SUBMIT"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
