import { useState } from 'react'
import FilterSection from './FilterSection'

const SearchBar = ({ 
  onSearch, 
  onFiltersChange,
  filters = {
    genres: [],
    yearRange: { from: 2000, to: new Date().getFullYear() },
    sortBy: 'releaseDate',
    sortOrder: 'desc'
  },
  placeholder = "Search manhwa..." 
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query, filters)
  }

  const handleFiltersChange = (newFilters) => {
    onFiltersChange?.(newFilters)
    // Trigger search with current query and new filters
    onSearch(query, newFilters)
  }

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        {/* Search input and button row */}
        <div className="search-input-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-input-field"
          />
          <button
            type="submit"
            className="btn btn-primary search-button-field"
          >
            Search
          </button>
        </div>

        {/* Filter section */}
        <FilterSection
          selectedGenres={filters.genres}
          onGenreChange={(genres) => handleFiltersChange({ ...filters, genres })}
          yearRange={filters.yearRange}
          onYearRangeChange={(yearRange) => handleFiltersChange({ ...filters, yearRange })}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={(sortBy, sortOrder) => handleFiltersChange({ ...filters, sortBy, sortOrder })}
        />
      </form>

      <style jsx>{`
        .search-bar-container {
          margin-bottom: 2rem;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .search-input-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .search-input-field {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 1rem;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          min-height: 48px;
          width: 100%;
        }

        .search-button-field {
          padding: 0.75rem 1.5rem;
          white-space: nowrap;
          min-height: 48px;
          width: 100%;
        }

        .genre-filter-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .search-input-row {
            flex-direction: row;
          }
          
          .search-input-field,
          .search-button-field {
            width: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default SearchBar