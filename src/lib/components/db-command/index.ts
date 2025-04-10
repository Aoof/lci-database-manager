export { default as DbCommand } from "./db-command.svelte";
import { toast } from "svelte-sonner";

import DbCommand from "./db-command.svelte";
export const dbCommand = (code : string) => toast(DbCommand, {
    duration: 5000,
    unstyled: true,
    class: "bg-popover text-popover-foreground rounded-lg p-4 shadow-lg",
    componentProps: {
        code: code,
        title: 'SQL Query',
        language:'sql'
    }
})