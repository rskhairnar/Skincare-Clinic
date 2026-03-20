// components/ui/SimpleMultiSelect.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const SimpleMultiSelect = ({
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  disabled = false,
  maxDisplay = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const selectedItems = options.filter((option) =>
    selected.includes(option.value)
  );

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value, e) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between min-h-10 px-3 py-2',
          'bg-gray-50 border border-gray-200 rounded-lg',
          'text-left text-sm transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-neutral-900 ring-offset-1'
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedItems.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : selectedItems.length <= maxDisplay ? (
            selectedItems.map((item) => (
              <Badge
                key={item.value}
                className="bg-neutral-900 text-white hover:bg-neutral-800 gap-1 pr-1"
              >
                {item.label}
                <button
                  type="button"
                  onClick={(e) => handleRemove(item.value, e)}
                  className="ml-1 rounded-full hover:bg-neutral-700 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <Badge className="bg-neutral-900 text-white">
              {selectedItems.length} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search */}
          <div className="flex items-center border-b border-gray-200 px-3">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-2 text-sm bg-transparent outline-none placeholder:text-gray-400"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No items found.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md',
                      'transition-colors hover:bg-gray-100',
                      isSelected && 'bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border shrink-0',
                        isSelected
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'border-gray-300'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className={cn('flex-1 text-left', isSelected && 'font-medium')}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-xs text-gray-400">
                        {option.description}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-500 text-center">
                {selected.length} item{selected.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SimpleMultiSelect };