import {
  checkForConflict,
  generateUniqueName,
  mergeInjections,
} from './injections';

describe('injections utilities', () => {
  describe('checkForConflict', () => {
    it('returns no conflict when existing injections are empty', () => {
      // Arrange & Act
      const result = checkForConflict('test_footprint', []);

      // Assert
      expect(result.hasConflict).toBe(false);
    });

    it('returns no conflict when existing injections are undefined', () => {
      // Arrange & Act
      const result = checkForConflict('test_footprint', undefined);

      // Assert
      expect(result.hasConflict).toBe(false);
    });

    it('returns no conflict when name does not exist', () => {
      // Arrange
      const existingInjections = [
        ['footprint', 'existing_footprint', 'content'],
      ];

      // Act
      const result = checkForConflict('new_footprint', existingInjections);

      // Assert
      expect(result.hasConflict).toBe(false);
    });

    it('returns conflict when name already exists', () => {
      // Arrange
      const existingInjections = [
        ['footprint', 'existing_footprint', 'content'],
      ];

      // Act
      const result = checkForConflict('existing_footprint', existingInjections);

      // Assert
      expect(result.hasConflict).toBe(true);
      if (result.hasConflict) {
        expect(result.conflictingName).toBe('existing_footprint');
      }
    });

    it('ignores non-footprint injections', () => {
      // Arrange
      const existingInjections = [['template', 'existing_template', 'content']];

      // Act
      const result = checkForConflict('existing_template', existingInjections);

      // Assert
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('generateUniqueName', () => {
    it('returns the base name when no conflicts exist', () => {
      // Arrange & Act
      const result = generateUniqueName('test_footprint', []);

      // Assert
      expect(result).toBe('test_footprint');
    });

    it('appends _1 when base name exists', () => {
      // Arrange
      const existingInjections = [['footprint', 'test_footprint', 'content']];

      // Act
      const result = generateUniqueName('test_footprint', existingInjections);

      // Assert
      expect(result).toBe('test_footprint_1');
    });

    it('increments number until unique name is found', () => {
      // Arrange
      const existingInjections = [
        ['footprint', 'test_footprint', 'content'],
        ['footprint', 'test_footprint_1', 'content'],
        ['footprint', 'test_footprint_2', 'content'],
      ];

      // Act
      const result = generateUniqueName('test_footprint', existingInjections);

      // Assert
      expect(result).toBe('test_footprint_3');
    });
  });

  describe('mergeInjections', () => {
    it('adds new footprints when no conflicts exist', () => {
      // Arrange
      const newFootprints = [
        { name: 'footprint1', content: 'content1' },
        { name: 'footprint2', content: 'content2' },
      ];
      const existingInjections: string[][] = [];

      // Act
      const result = mergeInjections(newFootprints, existingInjections, 'skip');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['footprint', 'footprint1', 'content1']);
      expect(result[1]).toEqual(['footprint', 'footprint2', 'content2']);
    });

    it('skips conflicting footprints when resolution is "skip"', () => {
      // Arrange
      const newFootprints = [{ name: 'existing', content: 'new_content' }];
      const existingInjections = [['footprint', 'existing', 'old_content']];

      // Act
      const result = mergeInjections(newFootprints, existingInjections, 'skip');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(['footprint', 'existing', 'old_content']);
    });

    it('overwrites conflicting footprints when resolution is "overwrite"', () => {
      // Arrange
      const newFootprints = [{ name: 'existing', content: 'new_content' }];
      const existingInjections = [['footprint', 'existing', 'old_content']];

      // Act
      const result = mergeInjections(
        newFootprints,
        existingInjections,
        'overwrite'
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(['footprint', 'existing', 'new_content']);
    });

    it('keeps both footprints with unique name when resolution is "keep-both"', () => {
      // Arrange
      const newFootprints = [{ name: 'existing', content: 'new_content' }];
      const existingInjections = [['footprint', 'existing', 'old_content']];

      // Act
      const result = mergeInjections(
        newFootprints,
        existingInjections,
        'keep-both'
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['footprint', 'existing', 'old_content']);
      expect(result[1]).toEqual(['footprint', 'existing_1', 'new_content']);
    });

    it('handles mixed scenarios with conflicts and non-conflicts', () => {
      // Arrange
      const newFootprints = [
        { name: 'existing', content: 'new_content' },
        { name: 'new_one', content: 'new_one_content' },
      ];
      const existingInjections = [['footprint', 'existing', 'old_content']];

      // Act
      const result = mergeInjections(
        newFootprints,
        existingInjections,
        'keep-both'
      );

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(['footprint', 'existing', 'old_content']);
      expect(result[1]).toEqual(['footprint', 'existing_1', 'new_content']);
      expect(result[2]).toEqual(['footprint', 'new_one', 'new_one_content']);
    });
  });
});
