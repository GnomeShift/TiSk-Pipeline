import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   totalItems,
                                                   itemsPerPage
                                               }) => {
    const generatePageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    return (
        <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Info */}
                <p className="text-sm text-muted-foreground">
                    Показано <span className="font-medium text-foreground">{startItem}-{endItem}</span> из{' '}
                    <span className="font-medium text-foreground">{totalItems}</span>
                </p>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Предыдущая</span>
                    </Button>

                    <div className="flex items-center gap-1">
                        {generatePageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="w-9 h-9 flex items-center justify-center text-muted-foreground"
                                >
                                  ...
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className="w-9 h-9 p-0"
                                >
                                    {page}
                                </Button>
                            )
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                    >
                        <span className="hidden sm:inline">Следующая</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default Pagination;