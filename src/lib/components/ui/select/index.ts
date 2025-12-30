import { Select as SelectPrimitive } from "bits-ui";

import SelectTrigger from "./select-trigger.svelte";
import SelectContent from "./select-content.svelte";
import SelectItem from "./select-item.svelte";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
};
