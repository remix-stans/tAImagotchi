import { cn } from "@/lib/utils";
import { Field } from "@base-ui-components/react/field";
import * as React from "react";

const Root = React.forwardRef<
	React.ComponentRef<typeof Field.Root>,
	React.ComponentPropsWithoutRef<typeof Field.Root>
>(({ className, ...props }, ref) => (
	<Field.Root
		ref={ref}
		className={cn("flex w-full max-w-64 flex-col items-start gap-1", className)}
		{...props}
	/>
));

Root.displayName = "Root";

const Label = React.forwardRef<
	React.ComponentRef<typeof Field.Label>,
	React.ComponentPropsWithoutRef<typeof Field.Label>
>(({ className, ...props }, ref) => (
	<Field.Label ref={ref} className={cn(className)} {...props} />
));

Label.displayName = "Label";

export { Label, Root };
