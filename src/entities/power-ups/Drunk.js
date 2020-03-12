import PowerUpBase from './PowerUpBase';

export default class Drunk extends PowerUpBase {
  onAttachToPlayer(player) {
    player.setReversedControls(true);
  }

  onDetachFromPlayer(player) {
    this.addTextAnimation(player.matterObj, 'I\'M SOBER!');
    player.setReversedControls(false);
  }
}
