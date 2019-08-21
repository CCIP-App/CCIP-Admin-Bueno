import crypto from 'crypto'

function md5Hash (token) {
  var md5 = crypto.createHash('md5')
  md5.update(token)
  return md5.digest('hex')
}

function generateSeed (md5hash) {
  const validChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

  let seed = md5hash
    .toLowerCase()
    .split('')
    .filter((char, pos, arr) => arr.indexOf(char) === pos)
    .slice(0, 16)

  while (seed.length < 16) {
    seed.push(validChar.find(char => !seed.includes(char)))
  }

  return seed.map(char => char.charCodeAt(0) > 0x60 ? (char.charCodeAt(0) - 0x57) : (char.charCodeAt(0) - 0x30))
}

export default function shuffledBingo (patterns) {
  return function (token, booths) {
    const seed = generateSeed(md5Hash(token))

    const boothSet = booths.reduce((set, booth) => {
      if (set[booth.significant] instanceof Array) {
        set[booth.significant].push(booth)
      } else {
        set[booth.significant] = [booth]
      }
      return set
    }, {})

    const shuffledBooth = Object.keys(boothSet).reduce((set, key) => {
      const validSeed = seed.filter(s => s < boothSet[key].length)
      set[key] = boothSet[key].map((_, pos, arr) => arr[validSeed[pos]])
      return set
    }, {})

    return patterns.split('').map((pattern) => pattern === '0' ? { isBonus: true } : shuffledBooth[pattern].pop())
  }
}
