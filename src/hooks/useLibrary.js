import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth.js'
import {
  getUserLibrary,
  addToLibrary,
  removeFromLibrary,
  updateLibraryItem,
  isInLibrary,
  clearLocalLibrary,
  migrateLocalLibrary
} from '../services/libraryService.js'

/**
 * Custom hook for managing user's manhwa library
 */
export const useLibrary = () => {
  const { user, isAuthenticated } = useAuth()
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load user's library from Supabase
   */
  const loadLibrary = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setLibrary([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // First try to migrate any local library data
      const libraryData = await migrateLocalLibrary(user.id)
      setLibrary(libraryData)
    } catch (err) {
      console.error('Error loading library:', err)
      setError(err.message || 'Failed to load library')
      
      // Fallback to local storage if Supabase fails
      try {
        const localLibrary = JSON.parse(localStorage.getItem('manhwaLibrary') || '[]')
        setLibrary(localLibrary)
      } catch (localErr) {
        console.error('Error loading local library:', localErr)
        setLibrary([])
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  /**
   * Add manhwa to library
   */
  const addManhwa = useCallback(async (manhwaItem) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User must be authenticated to add to library')
    }

    try {
      setError(null)
      
      // Check if already in library
      const alreadyExists = await isInLibrary(user.id, manhwaItem.id)
      if (alreadyExists) {
        throw new Error(`${manhwaItem.title} is already in your library!`)
      }

      // Add to Supabase
      const addedItem = await addToLibrary(user.id, manhwaItem)
      
      // Update local state
      setLibrary(prev => [addedItem, ...prev])
      
      return addedItem
    } catch (err) {
      console.error('Error adding to library:', err)
      setError(err.message || 'Failed to add to library')
      throw err
    }
  }, [isAuthenticated, user?.id])

  /**
   * Remove manhwa from library
   */
  const removeManhwa = useCallback(async (manhwaId) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User must be authenticated to remove from library')
    }

    try {
      setError(null)
      
      // Remove from Supabase
      await removeFromLibrary(user.id, manhwaId)
      
      // Update local state
      setLibrary(prev => prev.filter(item => item.manhwa_id !== manhwaId))
      
      return true
    } catch (err) {
      console.error('Error removing from library:', err)
      setError(err.message || 'Failed to remove from library')
      throw err
    }
  }, [isAuthenticated, user?.id])

  /**
   * Update manhwa in library
   */
  const updateManhwa = useCallback(async (manhwaId, updates) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User must be authenticated to update library')
    }

    try {
      setError(null)
      
      // Update in Supabase
      const updatedItem = await updateLibraryItem(user.id, manhwaId, updates)
      
      // Update local state
      setLibrary(prev => prev.map(item => 
        item.manhwa_id === manhwaId ? updatedItem : item
      ))
      
      return updatedItem
    } catch (err) {
      console.error('Error updating library item:', err)
      setError(err.message || 'Failed to update library item')
      throw err
    }
  }, [isAuthenticated, user?.id])

  /**
   * Check if manhwa is in library
   */
  const checkInLibrary = useCallback(async (manhwaId) => {
    if (!isAuthenticated || !user?.id) {
      return false
    }

    try {
      return await isInLibrary(user.id, manhwaId)
    } catch (err) {
      console.error('Error checking library status:', err)
      return false
    }
  }, [isAuthenticated, user?.id])

  /**
   * Clear library (for logout)
   */
  const clearLibrary = useCallback(() => {
    setLibrary([])
    setError(null)
    clearLocalLibrary()
  }, [])

  /**
   * Load library when user authentication state changes
   */
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadLibrary()
    } else {
      clearLibrary()
    }
  }, [isAuthenticated, user?.id, loadLibrary, clearLibrary])

  return {
    library,
    loading,
    error,
    addManhwa,
    removeManhwa,
    updateManhwa,
    checkInLibrary,
    clearLibrary,
    refreshLibrary: loadLibrary
  }
}

export default useLibrary