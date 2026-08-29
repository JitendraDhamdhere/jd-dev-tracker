/* Data Service - Unified interface for local and cloud data operations */

(function () {
  const DataService = {
    // Map of entity types to storage keys
    entityMap: {
      'dailyRoutine': 'daily_routine',
      'studySessions': 'study_sessions',
      'tasks': 'tasks',
      'notes': 'notes',
      'projects': 'projects',
      'jobs': 'jobs',
      'interviews': 'interviews',
      'roadmap': 'roadmap',
      'trackers': 'trackers',
      'profile': 'profile',
      'resumes': 'resumes',
      'certifications': 'certifications',
      'habits': 'habits',
      'daily_planner': 'daily_planner'
    },

    // Get data by entity type
    get: async function (entityType, filters = null) {
      const storageKey = this.entityMap[entityType];
      if (!storageKey) {
        console.warn(`Unknown entity type: ${entityType}`);
        return null;
      }

      const data = await StorageService.get(storageKey) || {};
      
      if (!filters) return data;
      
      // Apply filters if provided
      return this.filterData(data, filters);
    },

    // Get single record by ID
    getById: async function (entityType, id) {
      const data = this.get(entityType);
      if (!data) return null;

      if (Array.isArray(data)) {
        return data.find(item => item.id === id) || null;
      }
      
      // For object-based storage
      return data[id] || null;
    },

    // Create new record
    create: async function (entityType, record) {
      try {
        // Ensure record has ID
        if (!record.id) {
          record.id = Utils.generateId ? Utils.generateId() : `${entityType}_${Date.now()}`;
        }

        // Add timestamps
        record.createdAt = record.createdAt || new Date().toISOString();
        record.updatedAt = new Date().toISOString();

        const storageKey = this.entityMap[entityType];
        if (!storageKey) {
          throw new Error(`Unknown entity type: ${entityType}`);
        }

        let data = await StorageService.get(storageKey) || {};

        if (Array.isArray(data)) {
          // Array-based storage
          data.push(record);
        } else {
          // Object-based storage
          data[record.id] = record;
        }

        await StorageService.set(storageKey, data);
        console.log(`Created ${entityType}/${record.id}`);

        return record;
      } catch (error) {
        console.error(`Failed to create ${entityType}:`, error);
        throw error;
      }
    },

    // Update existing record
    update: async function (entityType, id, updates) {
      try {
        const storageKey = this.entityMap[entityType];
        if (!storageKey) {
          throw new Error(`Unknown entity type: ${entityType}`);
        }

        let data = await StorageService.get(storageKey) || {};
        let record = null;

        if (Array.isArray(data)) {
          const idx = data.findIndex(item => item.id === id);
          if (idx === -1) {
            throw new Error(`Record ${id} not found`);
          }
          record = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
          data[idx] = record;
        } else {
          if (!data[id]) {
            throw new Error(`Record ${id} not found`);
          }
          record = { ...data[id], ...updates, updatedAt: new Date().toISOString() };
          data[id] = record;
        }

        await StorageService.set(storageKey, data);
        console.log(`Updated ${entityType}/${id}`);

        return record;
      } catch (error) {
        console.error(`Failed to update ${entityType}/${id}:`, error);
        throw error;
      }
    },

    // Delete record
    delete: async function (entityType, id) {
      try {
        const storageKey = this.entityMap[entityType];
        if (!storageKey) {
          throw new Error(`Unknown entity type: ${entityType}`);
        }

        let data = await StorageService.get(storageKey) || {};

        if (Array.isArray(data)) {
          data = data.filter(item => item.id !== id);
        } else {
          delete data[id];
        }

        await StorageService.set(storageKey, data);
        console.log(`Deleted ${entityType}/${id}`);

        return true;
      } catch (error) {
        console.error(`Failed to delete ${entityType}/${id}:`, error);
        throw error;
      }
    },

    // Filter data by criteria
    filterData: async function (data, filters) {
      if (!Array.isArray(data)) {
        data = Object.values(data);
      }

      return data.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
          if (item[key] !== value) return false;
        }
        return true;
      });
    },


  };

  window.DataService = DataService;
})();
