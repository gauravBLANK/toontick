/**
 * Test utilities for library functionality
 * Use these in browser console to test library operations
 */

import { 
  getUserLibrary, 
  addToLibrary, 
  removeFromLibrary, 
  updateLibraryItem,
  isInLibrary 
} from '../services/libraryService.js'

// Test manhwa item
const testManhwa = {
  id: 'test-manhwa-1',
  title: 'Test Manhwa',
  image: 'https://example.com/image.jpg',
  status: 'reading',
  chapters: 10,
  averageScore: 8.5,
  popularity: 1000,
  year: 2023
}

/**
 * Test adding manhwa to library
 * Usage: testAddToLibrary('user-id-here')
 */
export const testAddToLibrary = async (userId) => {
  try {
    console.log('Testing add to library...')
    const result = await addToLibrary(userId, testManhwa)
    console.log('✅ Add successful:', result)
    return result
  } catch (error) {
    console.error('❌ Add failed:', error.message)
    throw error
  }
}

/**
 * Test getting user library
 * Usage: testGetLibrary('user-id-here')
 */
export const testGetLibrary = async (userId) => {
  try {
    console.log('Testing get library...')
    const result = await getUserLibrary(userId)
    console.log('✅ Get successful:', result)
    return result
  } catch (error) {
    console.error('❌ Get failed:', error.message)
    throw error
  }
}

/**
 * Test checking if manhwa is in library
 * Usage: testIsInLibrary('user-id-here', 'manhwa-id-here')
 */
export const testIsInLibrary = async (userId, manhwaId) => {
  try {
    console.log('Testing is in library...')
    const result = await isInLibrary(userId, manhwaId)
    console.log('✅ Check successful:', result)
    return result
  } catch (error) {
    console.error('❌ Check failed:', error.message)
    throw error
  }
}

/**
 * Test updating library item
 * Usage: testUpdateLibrary('user-id-here', 'manhwa-id-here')
 */
export const testUpdateLibrary = async (userId, manhwaId) => {
  try {
    console.log('Testing update library...')
    const result = await updateLibraryItem(userId, manhwaId, {
      status: 'completed',
      progress: 100
    })
    console.log('✅ Update successful:', result)
    return result
  } catch (error) {
    console.error('❌ Update failed:', error.message)
    throw error
  }
}

/**
 * Test removing from library
 * Usage: testRemoveFromLibrary('user-id-here', 'manhwa-id-here')
 */
export const testRemoveFromLibrary = async (userId, manhwaId) => {
  try {
    console.log('Testing remove from library...')
    const result = await removeFromLibrary(userId, manhwaId)
    console.log('✅ Remove successful:', result)
    return result
  } catch (error) {
    console.error('❌ Remove failed:', error.message)
    throw error
  }
}

/**
 * Run all tests
 * Usage: runAllTests('user-id-here')
 */
export const runAllTests = async (userId) => {
  try {
    console.log('🧪 Running all library tests...')
    
    // Test add
    const addResult = await testAddToLibrary(userId)
    
    // Test get
    await testGetLibrary(userId)
    
    // Test check
    await testIsInLibrary(userId, testManhwa.id)
    
    // Test update
    await testUpdateLibrary(userId, testManhwa.id)
    
    // Test remove
    await testRemoveFromLibrary(userId, testManhwa.id)
    
    console.log('✅ All tests passed!')
    return true
  } catch (error) {
    console.error('❌ Tests failed:', error.message)
    return false
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.libraryTests = {
    testAddToLibrary,
    testGetLibrary,
    testIsInLibrary,
    testUpdateLibrary,
    testRemoveFromLibrary,
    runAllTests
  }
}