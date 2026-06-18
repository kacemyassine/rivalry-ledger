import { generateImageFilename, populatePlayerForm, resetPlayerForm } from '../../src/lib/playerFormUtils';
import { getMockLeagueData, getMockPlayerById } from '../fixtures/mockSelectors';

const data = getMockLeagueData();

describe('playerFormUtils', () => {

  describe('generateImageFilename()', () => {
  test.each([
    ['Lionel Messi', 'jpg', 'lionel-messi.jpg'],
    ['Kylian Mbappé', 'png', 'kylian-mbappé.png'],
    ['Johan Cruyff', 'webp', 'johan-cruyff.webp'],
    ['Antoine  Griezmann', 'jpg', 'antoine-griezmann.jpg'], // double space
    ['  Frank Lampard  ', 'png', 'frank-lampard.png'], // leading/trailing spaces
    ['Lionel Messi', 'profile.png', 'lionel-messi.png'], // double extension      
  ])('generates correct filename for "%s" with extension "%s"', (name, ext, expected) => {
    const file = { name: `photo.${ext}` } as File;
    expect(generateImageFilename(name, file)).toBe(expected);
  });
});

  describe('populatePlayerForm()', () => {
  test('populates form state correctly from a player', () => {
    const player = getMockPlayerById(data, 'player-1');
    const result = populatePlayerForm(player, data.teams);
    expect(result.name).toBe(player.name);
    expect(result.teamId).toBe(player.teamId);
    expect(result.image).toBe(player.image || null);
  });

  test('returns null for image when player has no image', () => {
    const player = { ...getMockPlayerById(data, 'player-1'), image: '' };
    const result = populatePlayerForm(player, data.teams);
    expect(result.image).toBeNull();
  });
});

  describe('resetPlayerForm()', () => {
    test('resets form state to default values', () => {
      const result = resetPlayerForm(data.teams);
      expect(result.name).toBe('');
      expect(result.teamId).toBe(data.teams?.[0]?.id || '');
      expect(result.image).toBeNull();
    });
  });

});
