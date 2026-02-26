'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const AccordionContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
}>({});

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { type?: 'single' | 'multiple'; collapsible?: boolean }
>(({ className, children, type, collapsible, ...props }, ref) => {
    const [value, setValue] = React.useState<string>('');

    return (
        <AccordionContext.Provider value={{ value, onValueChange: setValue }}>
            <div ref={ref} className={cn(className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
});
Accordion.displayName = 'Accordion';

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
    <div ref={ref} className={cn('border-b', className)} data-value={value} {...props}>
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { value } as any);
            }
            return child;
        })}
    </div>
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(AccordionContext);
    const isOpen = selectedValue === value;

    return (
        <div className="flex">
            <button
                ref={ref}
                type="button"
                onClick={() => onValueChange?.(isOpen ? '' : value!)}
                className={cn(
                    'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
                    className
                )}
                data-state={isOpen ? 'open' : 'closed'}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    );
});
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(AccordionContext);
    const isOpen = selectedValue === value;

    return (
        <div
            ref={ref}
            data-state={isOpen ? 'open' : 'closed'}
            className={cn(
                'grid transition-[grid-template-rows] duration-200 text-sm data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]',
                className
            )}
            {...props}
        >
            <div className="overflow-hidden">
                <div className="pb-4 pt-0">{children}</div>
            </div>
        </div>
    );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
