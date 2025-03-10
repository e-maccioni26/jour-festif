
import React from 'react';
import { Check, ChevronsUpDown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Store as StoreType } from '../context/AuthContext';

interface StoreSelectorProps {
  stores: StoreType[];
  selectedStoreId?: string;
  onChange: (storeId: string | undefined) => void;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  selectedStoreId,
  onChange
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedStore = stores.find(
    (store) => store.id === selectedStoreId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Store className="h-4 w-4" />
            {selectedStore ? 
              selectedStore.name : 
              "Tous les magasins"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Rechercher un magasin..." />
          <CommandList>
            <CommandEmpty>Aucun magasin trouvé.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !selectedStoreId ? "opacity-100" : "opacity-0"
                  )}
                />
                Tous les magasins
              </CommandItem>
              {stores.map((store) => (
                <CommandItem
                  key={store.id}
                  onSelect={() => {
                    onChange(store.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      store.id === selectedStoreId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {store.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
