import { useState, useEffect, useCallback } from 'react'
import { getManhwaList } from '../services/manhwaAPI'

const useFetchManhwa = () => {
  const [manhwa, setManhwa] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(() => {
    // Load current page from localStorage or default to 1
    const saved = localStorage.getItem('manhwaCurrentPage')
    return saved ? parseInt(saved) : 1
  })
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchData = useCallback(async (startPage = 1, append = false) => {
    try {
      if (!append) setLoading(true)
      else setIsLoadingMore(true)
      
      const data = await getManhwaList(startPage, 3) // Fetch 3 pages starting from startPage
      
      if (append) {
        setManhwa(prev => {
          // Remove duplicates by ID
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = data.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
      } else {
        setManhwa(data)
      }
      
      const newCurrentPage = startPage + 3
      setCurrentPage(newCurrentPage) // Update to next set of pages
      localStorage.setItem('manhwaCurrentPage', newCurrentPage.toString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  const clearCache = useCallback(() => {
    localStorage.removeItem('manhwaCurrentPage')
    setCurrentPage(1)
    setManhwa([])
    fetchData(1, false)
  }, [fetchData])

  const fetchMoreManhwa = useCallback(() => {
    if (!isLoadingMore) {
      fetchData(currentPage, true)
    }
  }, [currentPage, isLoadingMore, fetchData])

  useEffect(() => {
    // Simple initial load - just fetch first batch
    fetchData(1, false)
  }, [fetchData])

  return { manhwa, loading, error, fetchMoreManhwa, isLoadingMore, clearCache }
}

export default useFetchManhwa