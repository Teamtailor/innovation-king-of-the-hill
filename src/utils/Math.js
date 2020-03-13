export default {
  GetWeightedRandomIndex: (values) => {
    const sum = values.reduce((a, b) => a + b, 0);
    const rand = Phaser.Math.Between(0, sum);
    return values.map(((sum) => (value) => {
      sum += value;
      return sum;
    })(0)).filter((el) => rand > el).length;
  }
};
