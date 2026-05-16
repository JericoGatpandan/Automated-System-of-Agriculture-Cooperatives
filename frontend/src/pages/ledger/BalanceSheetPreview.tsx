import { FileText, Printer, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BalanceSheetControls({ onGenerate, onPrint }) {
  return (
    <div className="bg-white rounded-xl p-2.5 flex flex-col gap-2.5">

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">

        {/* Select Farmer */}
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="farmer-select">Select Farmer</Label>
          <Select>
            <SelectTrigger id="farmer-select" className="h-11">
              <SelectValue placeholder="Choose a Farmer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bhfc-001">Juan R. dela Cruz</SelectItem>
              {/* Add more farmers here */}
            </SelectContent>
          </Select>
        </div>

        {/* Select Period */}
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="period-input">Select Period</Label>
          <div className="relative">
            <Input
              id="period-input"
              type="text"
              placeholder="MM/DD/YYYY – MM/DD/YYYY"
              className="h-11 pr-9"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">

        <Button
          className="flex-1 h-10 bg-green-900 hover:bg-green-800 text-white font-semibold text-base gap-1.5"
          onClick={onGenerate}
        >
          <FileText className="size-5 opacity-80" />
          Generate Preview
        </Button>

        <Button
          variant="outline"
          className="flex-1 h-10 border-2 border-neutral-400 text-green-900 hover:border-green-900 hover:text-green-900 font-semibold text-base gap-1.5"
          onClick={onPrint}
        >
          <Printer className="size-5" />
          Print / Download
        </Button>

      </div>
    </div>
  );
}