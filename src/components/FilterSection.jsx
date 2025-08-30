import { useState, useRef, useEffect } from 'react'
import GenreFilter from './GenreFilter'

const FilterSection = ({ 
  selectedGenres = [], 
  onGenreChange,
  yearRange = { from: 2000, to: new Date().getFullYear() },
  onYearRangeChange,
  sortBy = 'releaseDate',
  sortOrder = 'desc',
  onSortChange,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentYear = new Date().getFullYear()
  
  // Year validation
  const handleYearChange = (type, value) => {
    const year = parseInt(value) || (type === 'from' ? 2000 : currentYear)
    const newRange = { ...yearRange, [type]: year }
    
    // Validate range
    if (type === 'from' && year > yearRange.to) {
      newRange.to = year
    } else if (type === 'to' && year < yearRange.from) {
      newRange.from = year
    }
    
    onYearRangeChange(newRange)
  }

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle order if same criteria
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New criteria with default desc order
      onSortChange(newSortBy, 'desc')
    }
  }

  const resetFilters = () => {
    onGenreChange([])
    onYearRangeChange({ from: 2000, to: currentYear })
    onSortChange('releaseDate', 'desc')
  }

  const hasActiveFilters = selectedGenres.length > 0 || 
    yearRange.from !== 2000 || 
    yearRange.to !== currentYear ||
    sortBy !== 'releaseDate' ||
    sortOrder !== 'desc'

  return (
    <div className={`filter-section ${className}`}>
      {/* Mobile toggle button */}
      <div className="mobile-filter-toggle">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-content"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '48px'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = 'var(--border-hover)'}
          onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
        >
          <span>
            Filters & Sorting
            {hasActiveFilters && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Active
              </span>
            )}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <path d="M4.427 6.427a.75.75 0 011.06 0L8 8.94l2.513-2.513a.75.75 0 111.06 1.06l-3.043 3.044a.75.75 0 01-1.06 0L4.427 7.487a.75.75 0 010-1.06z" />
          </svg>
        </button>
      </div>

      {/* Filter content */}
      <div
        id="filter-content"
        className="filter-content"
        style={{
          display: isExpanded ? 'block' : 'none'
        }}
      >
        <div className="filter-grid">
          {/* Genre Filter */}
          <div className="filter-item">
            <label className="filter-label">
              Genres
            </label>
            <GenreFilter
              selectedGenres={selectedGenres}
              onGenreChange={onGenreChange}
            />
          </div>

          {/* Year Range Filter */}
          <div className="filter-item">
            <label className="filter-label">
              Release Year
            </label>
            <div className="year-range-container">
              <div className="year-input-group">
                <label htmlFor="year-from" className="sr-only">From year</label>
                <input
                  id="year-from"
                  type="number"
                  min="1990"
                  max={currentYear}
                  value={yearRange.from}
                  onChange={(e) => handleYearChange('from', e.target.value)}
                  placeholder="From"
                  aria-label="From year"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    minHeight: '48px'
                  }}
                />
              </div>
              <span style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                padding: '0 0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                to
              </span>
              <div className="year-input-group">
                <label htmlFor="year-to" className="sr-only">To year</label>
                <input
                  id="year-to"
                  type="number"
                  min="1990"
                  max={currentYear}
                  value={yearRange.to}
                  onChange={(e) => handleYearChange('to', e.target.value)}
                  placeholder="To"
                  aria-label="To year"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    minHeight: '48px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="filter-item">
            <label className="filter-label">
              Sort By
            </label>
            <div className="sort-controls">
              <div className="sort-buttons">
                <button
                  type="button"
                  onClick={() => handleSortChange('releaseDate')}
                  aria-pressed={sortBy === 'releaseDate'}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: sortBy === 'releaseDate' ? 'var(--primary-color)' : 'var(--bg-secondary)',
                    color: sortBy === 'releaseDate' ? 'white' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'releaseDate') {
                      e.target.style.backgroundColor = 'var(--border-color)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'releaseDate') {
                      e.target.style.backgroundColor = 'var(--bg-secondary)'
                    }
                  }}
                >
                  Release Date
                  {sortBy === 'releaseDate' && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      {sortOrder === 'asc' ? (
                        <path d="M6 2L9 8H3L6 2Z" />
                      ) : (
                        <path d="M6 10L3 4H9L6 10Z" />
                      )}
                    </svg>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSortChange('rating')}
                  aria-pressed={sortBy === 'rating'}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: sortBy === 'rating' ? 'var(--primary-color)' : 'var(--bg-secondary)',
                    color: sortBy === 'rating' ? 'white' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (sortBy !== 'rating') {
                      e.target.style.backgroundColor = 'var(--border-color)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== 'rating') {
                      e.target.style.backgroundColor = 'var(--bg-secondary)'
                    }
                  }}
                >
                  Rating
                  {sortBy === 'rating' && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      {sortOrder === 'asc' ? (
                        <path d="M6 2L9 8H3L6 2Z" />
                      ) : (
                        <path d="M6 10L3 4H9L6 10Z" />
                      )}
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="filter-item">
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  minHeight: '48px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-secondary)'
                  e.target.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = 'var(--text-secondary)'
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Screen reader only text */}
      <div 
        aria-live="polite"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {hasActiveFilters && `Filters active: ${selectedGenres.length} genres, year range ${yearRange.from}-${yearRange.to}, sorted by ${sortBy} ${sortOrder}ending`}
      </div>

      <style jsx>{`
        .filter-section {
          margin-bottom: 1.5rem;
        }

        .mobile-filter-toggle {
          display: block;
        }

        .filter-content {
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-secondary);
        }

        .filter-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .year-range-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .year-input-group {
          flex: 1;
        }

        .sort-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sort-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (min-width: 768px) {
          .mobile-filter-toggle {
            display: none;
          }

          .filter-content {
            display: block !important;
            margin-top: 0;
            padding: 0;
            border: none;
            background-color: transparent;
          }

          .filter-grid {
            grid-template-columns: 2fr 1.5fr 1.5fr auto;
            align-items: end;
            gap: 1rem;
          }

          .filter-item:last-child {
            grid-column: span 1;
          }
        }

        @media (min-width: 1024px) {
          .filter-grid {
            grid-template-columns: 2fr 1.5fr 2fr auto;
          }
        }
      `}</style>
    </div>
  )
}

export default FilterSection