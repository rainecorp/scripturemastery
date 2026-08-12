/* passages.js — Seminary content pack (T9)
   ===========================================================================
   The 100 retired Scripture Mastery passages are authored beside the four
   campaigns that currently contain them. The registered catalog keeps those
   concepts separate: a passage can be placed in additional campaigns later
   without copying it or changing its stable ID.

   Passage IDs are random, opaque authoring-time values. Never regenerate one
   from its reference or text; those fields are editable content.
   =========================================================================== */
const SEMINARY_CAMPAIGN_CONTENT = [
  {
    campaign: {
      id:"camp_retired_ot", track:"seminary",
      name:"The Tabernacle Tower", shortName:"Old Testament / Pearl of Great Price",
      subtitle:"Retired Verses of Scripture Mastery",
      towerArt:{kit:"tabernacle-tower", baseWidth:640},
      hue:"#fb923c", soft:"rgba(251,146,60,.22)", icon:"🔥",
      tag:"Ancient fire, written in stone.", order:4, status:"active"
    },
    passages: [
    {
"id": "p_b549f0a6",
"ref": "Moses 1:39",
        "topic": "God’s work and glory",
        "texts": {"lds2013": "For behold, this is my work and my glory—to bring to pass the immortality and eternal life of man."}
    },
    {
        "id": "p_44345585",
        "ref": "Moses 7:18",
        "topic": "Zion: one heart and one mind",
        "texts": {"lds2013": "And the Lord called his people Zion, because they were of one heart and one mind, and dwelt in righteousness; and there was no poor among them."}
    },
    {
        "id": "p_e81fdebb",
        "ref": "Abraham 3:22–23",
        "topic": "Chosen before birth",
        "texts": {"lds2013": "Now the Lord had shown unto me, Abraham, the intelligences that were organized before the world was; and among all these there were many of the noble and great ones; And God saw these souls that they were good, and he stood in the midst of them, and he said: These I will make my rulers; for he stood among those that were spirits, and he saw that they were good; and he said unto me: Abraham, thou art one of them; thou wast chosen before thou wast born."}
    },
    {
        "id": "p_f24327f6",
        "ref": "Genesis 1:26–27",
        "topic": "Created in the image of God",
        "texts": {"lds2013": "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth. So God created man in his own image, in the image of God created he him; male and female created he them."}
    },
    {
        "id": "p_9be9b67e",
        "ref": "Genesis 39:9",
        "topic": "Joseph resists temptation",
        "texts": {"lds2013": "There is none greater in this house than I; neither hath he kept back any thing from me but thee, because thou art his wife: how then can I do this great wickedness, and sin against God?"}
    },
    {
        "id": "p_2350f5a9",
        "ref": "Exodus 20:3–17",
        "topic": "The Ten Commandments",
        "texts": {"lds2013": "Thou shalt have no other gods before me. Thou shalt not make unto thee any graven image, or any likeness of any thing that is in heaven above, or that is in the earth beneath, or that is in the water under the earth: Thou shalt not bow down thyself to them, nor serve them: for I the Lord thy God am a jealous God, visiting the iniquity of the fathers upon the children unto the third and fourth generation of them that hate me; And shewing mercy unto thousands of them that love me, and keep my commandments. Thou shalt not take the name of the Lord thy God in vain; for the Lord will not hold him guiltless that taketh his name in vain. Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it. Honour thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee. Thou shalt not kill. Thou shalt not commit adultery. Thou shalt not steal. Thou shalt not bear false witness against thy neighbour. Thou shalt not covet thy neighbour’s house, thou shalt not covet thy neighbour’s wife, nor his manservant, nor his maidservant, nor his ox, nor his ass, nor any thing that is thy neighbour’s."}
    },
    {
        "id": "p_4d194e8d",
        "ref": "Exodus 33:11",
        "topic": "The Lord spake face to face",
        "texts": {"lds2013": "And the Lord spake unto Moses face to face, as a man speaketh unto his friend. And he turned again into the camp: but his servant Joshua, the son of Nun, a young man, departed not out of the tabernacle."}
    },
    {
        "id": "p_8ac988a8",
        "ref": "Leviticus 19:18",
        "topic": "Love thy neighbour as thyself",
        "texts": {"lds2013": "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself: I am the Lord."}
    },
    {
        "id": "p_4738a95e",
        "ref": "Deuteronomy 7:3–4",
        "topic": "Do not turn from following the Lord",
        "texts": {"lds2013": "Neither shalt thou make marriages with them; thy daughter thou shalt not give unto his son, nor his daughter shalt thou take unto thy son. For they will turn away thy son from following me, that they may serve other gods: so will the anger of the Lord be kindled against you, and destroy thee suddenly."}
    },
    {
        "id": "p_aa377d61",
        "ref": "Joshua 1:8",
        "topic": "Meditate in the law day and night",
        "texts": {"lds2013": "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success."}
    },
    {
        "id": "p_32d99c10",
        "ref": "Joshua 24:15",
        "topic": "Choose you this day whom ye will serve",
        "texts": {"lds2013": "And if it seem evil unto you to serve the Lord, choose you this day whom ye will serve; whether the gods which your fathers served that were on the other side of the flood, or the gods of the Amorites, in whose land ye dwell: but as for me and my house, we will serve the Lord."}
    },
    {
        "id": "p_5b5e9e88",
        "ref": "1 Samuel 16:7",
        "topic": "The Lord looketh on the heart",
        "texts": {"lds2013": "But the Lord said unto Samuel, Look not on his countenance, or on the height of his stature; because I have refused him: for the Lord seeth not as man seeth; for man looketh on the outward appearance, but the Lord looketh on the heart."}
    },
    {
        "id": "p_d881f6ab",
        "ref": "Job 19:25–26",
        "topic": "I know that my Redeemer liveth",
        "texts": {"lds2013": "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth: And though after my skin worms destroy this body, yet in my flesh shall I see God:"}
    },
    {
        "id": "p_286ff461",
        "ref": "Psalm 24:3–4",
        "topic": "Clean hands and a pure heart",
        "texts": {"lds2013": "Who shall ascend into the hill of the Lord? or who shall stand in his holy place? He that hath clean hands, and a pure heart; who hath not lifted up his soul unto vanity, nor sworn deceitfully."}
    },
    {
        "id": "p_07dc0b7f",
        "ref": "Proverbs 3:5–6",
        "topic": "Trust in the Lord",
        "texts": {"lds2013": "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."}
    },
    {
        "id": "p_3cf226aa",
        "ref": "Isaiah 1:18",
        "topic": "Though your sins be as scarlet",
        "texts": {"lds2013": "Come now, and let us reason together, saith the Lord: though your sins be as scarlet, they shall be as white as snow; though they be red like crimson, they shall be as wool."}
    },
    {
        "id": "p_b3e43cab",
        "ref": "Isaiah 29:13–14",
        "topic": "A marvellous work and a wonder",
        "texts": {"lds2013": "Wherefore the Lord said, Forasmuch as this people draw near me with their mouth, and with their lips do honour me, but have removed their heart far from me, and their fear toward me is taught by the precept of men: Therefore, behold, I will proceed to do a marvellous work among this people, even a marvellous work and a wonder: for the wisdom of their wise men shall perish, and the understanding of their prudent men shall be hid."}
    },
    {
        "id": "p_f33d1aa7",
        "ref": "Isaiah 53:3–5",
        "topic": "With his stripes we are healed",
        "texts": {"lds2013": "He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not. Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed."}
    },
    {
        "id": "p_00920251",
        "ref": "Isaiah 55:8–9",
        "topic": "My ways are higher than your ways",
        "texts": {"lds2013": "For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord. For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts."}
    },
    {
        "id": "p_e06b1b4c",
        "ref": "Jeremiah 16:16",
        "topic": "Fishers and hunters",
        "texts": {"lds2013": "Behold, I will send for many fishers, saith the Lord, and they shall fish them; and after will I send for many hunters, and they shall hunt them from every mountain, and from every hill, and out of the holes of the rocks."}
    },
    {
        "id": "p_7dea6e80",
        "ref": "Ezekiel 37:15–17",
        "topic": "The sticks of Judah and Joseph",
        "texts": {"lds2013": "The word of the Lord came again unto me, saying, Moreover, thou son of man, take thee one stick, and write upon it, For Judah, and for the children of Israel his companions: then take another stick, and write upon it, For Joseph, the stick of Ephraim, and for all the house of Israel his companions: And join them one to another into one stick; and they shall become one in thine hand."}
    },
    {
        "id": "p_9d0422ed",
        "ref": "Daniel 2:44–45",
        "topic": "The kingdom that shall stand forever",
        "texts": {"lds2013": "And in the days of these kings shall the God of heaven set up a kingdom, which shall never be destroyed: and the kingdom shall not be left to other people, but it shall break in pieces and consume all these kingdoms, and it shall stand for ever. Forasmuch as thou sawest that the stone was cut out of the mountain without hands, and that it brake in pieces the iron, the brass, the clay, the silver, and the gold; the great God hath made known to the king what shall come to pass hereafter: and the dream is certain, and the interpretation thereof sure."}
    },
    {
        "id": "p_77966ebf",
        "ref": "Amos 3:7",
        "topic": "The Lord reveals His secret to prophets",
        "texts": {"lds2013": "Surely the Lord God will do nothing, but he revealeth his secret unto his servants the prophets."}
    },
    {
        "id": "p_70a9f00d",
        "ref": "Malachi 3:8–10",
        "topic": "Tithes and offerings",
        "texts": {"lds2013": "Will a man rob God? Yet ye have robbed me. But ye say, Wherein have we robbed thee? In tithes and offerings. Ye are cursed with a curse: for ye have robbed me, even this whole nation. Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it."}
    },
    {
        "id": "p_bdc91689",
        "ref": "Malachi 4:5–6",
        "topic": "Elijah turns hearts",
        "texts": {"lds2013": "Behold, I will send you Elijah the prophet before the coming of the great and dreadful day of the Lord: And he shall turn the heart of the fathers to the children, and the heart of the children to their fathers, lest I come and smite the earth with a curse."}
    }
    ]
  },
  {
    campaign: {
      id:"camp_retired_nt", track:"seminary",
      name:"The Jerusalem Tower", shortName:"New Testament",
      subtitle:"Retired Verses of Scripture Mastery",
      towerArt:{kit:"jerusalem-temple-tower", baseWidth:640},
      hue:"#60a5fa", soft:"rgba(96,165,250,.22)", icon:"🕊️",
      tag:"Walk where the Master walked.", order:2, status:"active"
    },
    passages: [
    {
        "id": "p_23b0f988",
        "ref": "Matthew 5:14–16",
        "topic": "Ye are the light of the world",
        "texts": {"lds2013": "Ye are the light of the world. A city that is set on an hill cannot be hid. Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house. Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven."}
    },
    {
        "id": "p_91930a0d",
        "ref": "Matthew 6:24",
        "topic": "Ye cannot serve God and mammon",
        "texts": {"lds2013": "No man can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot serve God and mammon."}
    },
    {
        "id": "p_4f851c1a",
        "ref": "Matthew 16:15–19",
        "topic": "The keys of the kingdom",
        "texts": {"lds2013": "He saith unto them, But whom say ye that I am? And Simon Peter answered and said, Thou art the Christ, the Son of the living God. And Jesus answered and said unto him, Blessed art thou, Simon Bar-jona: for flesh and blood hath not revealed it unto thee, but my Father which is in heaven. And I say also unto thee, That thou art Peter, and upon this rock I will build my church; and the gates of hell shall not prevail against it. And I will give unto thee the keys of the kingdom of heaven: and whatsoever thou shalt bind on earth shall be bound in heaven: and whatsoever thou shalt loose on earth shall be loosed in heaven."}
    },
    {
        "id": "p_162868f0",
        "ref": "Matthew 25:40",
        "topic": "Inasmuch as ye have done it unto one of the least",
        "texts": {"lds2013": "And the King shall answer and say unto them, Verily I say unto you, Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me."}
    },
    {
        "id": "p_0ae914d0",
        "ref": "Luke 24:36–39",
        "topic": "A spirit hath not flesh and bones",
        "texts": {"lds2013": "And as they thus spake, Jesus himself stood in the midst of them, and saith unto them, Peace be unto you. But they were terrified and affrighted, and supposed that they had seen a spirit. And he said unto them, Why are ye troubled? and why do thoughts arise in your hearts? Behold my hands and my feet, that it is I myself: handle me, and see; for a spirit hath not flesh and bones, as ye see me have."}
    },
    {
        "id": "p_fd2f227d",
        "ref": "John 3:5",
        "topic": "Born of water and of the Spirit",
        "texts": {"lds2013": "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God."}
    },
    {
        "id": "p_ed21fd2e",
        "ref": "John 7:17",
        "topic": "Testing doctrine by doing",
        "texts": {"lds2013": "If any man will do his will, he shall know of the doctrine, whether it be of God, or whether I speak of myself."}
    },
    {
        "id": "p_da083082",
        "ref": "John 10:16",
        "topic": "Other sheep I have",
        "texts": {"lds2013": "And other sheep I have, which are not of this fold: them also I must bring, and they shall hear my voice; and there shall be one fold, and one shepherd."}
    },
    {
        "id": "p_a65c43b1",
        "ref": "John 14:15",
        "topic": "If ye love me, keep my commandments",
        "texts": {"lds2013": "If ye love me, keep my commandments."}
    },
    {
        "id": "p_a21ee91c",
        "ref": "John 17:3",
        "topic": "This is life eternal",
        "texts": {"lds2013": "And this is life eternal, that they might know thee the only true God, and Jesus Christ, whom thou hast sent."}
    },
    {
        "id": "p_e146cb15",
        "ref": "Acts 7:55–56",
        "topic": "Stephen saw the Father and the Son",
        "texts": {"lds2013": "But he, being full of the Holy Ghost, looked up steadfastly into heaven, and saw the glory of God, and Jesus standing on the right hand of God, And said, Behold, I see the heavens opened, and the Son of man standing on the right hand of God."}
    },
    {
        "id": "p_17081ce4",
        "ref": "Romans 1:16",
        "topic": "Not ashamed of the gospel",
        "texts": {"lds2013": "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek."}
    },
    {
        "id": "p_651440f1",
        "ref": "1 Corinthians 10:13",
        "topic": "God will make a way to escape",
        "texts": {"lds2013": "There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it."}
    },
    {
        "id": "p_b94ebdc1",
        "ref": "1 Corinthians 15:20–22",
        "topic": "The Resurrection through Christ",
        "texts": {"lds2013": "But now is Christ risen from the dead, and become the firstfruits of them that slept. For since by man came death, by man came also the resurrection of the dead. For as in Adam all die, even so in Christ shall all be made alive."}
    },
    {
        "id": "p_22f91456",
        "ref": "1 Corinthians 15:29",
        "topic": "Baptism for the dead",
        "texts": {"lds2013": "Else what shall they do which are baptized for the dead, if the dead rise not at all? why are they then baptized for the dead?"}
    },
    {
        "id": "p_9c2b92cd",
        "ref": "1 Corinthians 15:40–42",
        "topic": "Degrees of glory",
        "texts": {"lds2013": "There are also celestial bodies, and bodies terrestrial: but the glory of the celestial is one, and the glory of the terrestrial is another. There is one glory of the sun, and another glory of the moon, and another glory of the stars: for one star differeth from another star in glory. So also is the resurrection of the dead. It is sown in corruption; it is raised in incorruption:"}
    },
    {
        "id": "p_6253de3e",
        "ref": "Ephesians 4:11–14",
        "topic": "Why the Church is organized",
        "texts": {"lds2013": "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ: Till we all come in the unity of the faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the stature of the fulness of Christ: That we henceforth be no more children, tossed to and fro, and carried about with every wind of doctrine, by the sleight of men, and cunning craftiness, whereby they lie in wait to deceive;"}
    },
    {
        "id": "p_c6b5f95d",
        "ref": "2 Thessalonians 2:1–3",
        "topic": "There shall come a falling away first",
        "texts": {"lds2013": "Now we beseech you, brethren, by the coming of our Lord Jesus Christ, and by our gathering together unto him, That ye be not soon shaken in mind, or be troubled, neither by spirit, nor by word, nor by letter as from us, as that the day of Christ is at hand. Let no man deceive you by any means: for that day shall not come, except there come a falling away first, and that man of sin be revealed, the son of perdition;"}
    },
    {
        "id": "p_f57c4dc4",
        "ref": "2 Timothy 3:1–5",
        "topic": "Perilous times shall come",
        "texts": {"lds2013": "This know also, that in the last days perilous times shall come. For men shall be lovers of their own selves, covetous, boasters, proud, blasphemers, disobedient to parents, unthankful, unholy, Without natural affection, trucebreakers, false accusers, incontinent, fierce, despisers of those that are good, Traitors, heady, highminded, lovers of pleasures more than lovers of God; Having a form of godliness, but denying the power thereof: from such turn away."}
    },
    {
        "id": "p_c772188b",
        "ref": "2 Timothy 3:16–17",
        "topic": "All scripture is given by inspiration of God",
        "texts": {"lds2013": "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, throughly furnished unto all good works."}
    },
    {
        "id": "p_24730e0d",
        "ref": "Hebrews 5:4",
        "topic": "Called of God, as was Aaron",
        "texts": {"lds2013": "And no man taketh this honour unto himself, but he that is called of God, as was Aaron."}
    },
    {
        "id": "p_9f1ca2f1",
        "ref": "James 1:5–6",
        "topic": "Ask of God in faith",
        "texts": {"lds2013": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him. But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed."}
    },
    {
        "id": "p_3d6b39d9",
        "ref": "James 2:17–18",
        "topic": "Faith without works is dead",
        "texts": {"lds2013": "Even so faith, if it hath not works, is dead, being alone. Yea, a man may say, Thou hast faith, and I have works: shew me thy faith without thy works, and I will shew thee my faith by my works."}
    },
    {
        "id": "p_022f5e8d",
        "ref": "Revelation 14:6–7",
        "topic": "The everlasting gospel",
        "texts": {"lds2013": "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people, Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters."}
    },
    {
        "id": "p_22e7d0da",
        "ref": "Revelation 20:12–13",
        "topic": "Judged according to their works",
        "texts": {"lds2013": "And I saw the dead, small and great, stand before God; and the books were opened: and another book was opened, which is the book of life: and the dead were judged out of those things which were written in the books, according to their works. And the sea gave up the dead which were in it; and death and hell delivered up the dead which were in them: and they were judged every man according to their works."}
    }
    ]
  },
  {
    campaign: {
      id:"camp_retired_bom", track:"seminary",
      name:"The Ancient America Tower", shortName:"Book of Mormon",
      subtitle:"Retired Verses of Scripture Mastery",
      towerArt:{kit:"ancient-america-temple", baseWidth:640},
      hue:"#34d399", soft:"rgba(52,211,153,.22)", icon:"🌴",
      tag:"Hold the rod. Climb to the tree.", order:1, status:"active"
    },
    passages: [
    {
        "id": "p_05aa9da7",
        "ref": "1 Nephi 3:7",
        "topic": "I will go and do",
        "texts": {"lds2013": "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them."}
    },
    {
        "id": "p_79aef65b",
        "ref": "1 Nephi 19:23",
        "topic": "Liken all scriptures unto us",
        "texts": {"lds2013": "And I did read many things unto them which were written in the books of Moses; but that I might more fully persuade them to believe in the Lord their Redeemer I did read unto them that which was written by the prophet Isaiah; for I did liken all scriptures unto us, that it might be for our profit and learning."}
    },
    {
        "id": "p_de9f74d8",
        "ref": "2 Nephi 2:25",
        "topic": "Men are, that they might have joy",
        "texts": {"lds2013": "Adam fell that men might be; and men are, that they might have joy."}
    },
    {
        "id": "p_214d7402",
        "ref": "2 Nephi 2:27",
        "topic": "Free to choose liberty and eternal life",
        "texts": {"lds2013": "Wherefore, men are free according to the flesh; and all things are given them which are expedient unto man. And they are free to choose liberty and eternal life, through the great Mediator of all men, or to choose captivity and death, according to the captivity and power of the devil; for he seeketh that all men might be miserable like unto himself."}
    },
    {
        "id": "p_d28728f4",
        "ref": "2 Nephi 9:28–29",
        "topic": "To be learned is good",
        "texts": {"lds2013": "O that cunning plan of the evil one! O the vainness, and the frailties, and the foolishness of men! When they are learned they think they are wise, and they hearken not unto the counsel of God, for they set it aside, supposing they know of themselves, wherefore, their wisdom is foolishness and it profiteth them not. And they shall perish. But to be learned is good if they hearken unto the counsels of God."}
    },
    {
        "id": "p_44d95f5c",
        "ref": "2 Nephi 28:7–9",
        "topic": "False and vain doctrines",
        "texts": {"lds2013": "Yea, and there shall be many which shall say: Eat, drink, and be merry, for tomorrow we die; and it shall be well with us. And there shall also be many which shall say: Eat, drink, and be merry; nevertheless, fear God—he will justify in committing a little sin; yea, lie a little, take the advantage of one because of his words, dig a pit for thy neighbor; there is no harm in this; and do all these things, for tomorrow we die; and if it so be that we are guilty, God will beat us with a few stripes, and at last we shall be saved in the kingdom of God. Yea, and there shall be many which shall teach after this manner, false and vain and foolish doctrines, and shall be puffed up in their hearts, and shall seek deep to hide their counsels from the Lord; and their works shall be in the dark."}
    },
    {
        "id": "p_4e057f38",
        "ref": "2 Nephi 32:3",
        "topic": "Feast upon the words of Christ",
        "texts": {"lds2013": "Angels speak by the power of the Holy Ghost; wherefore, they speak the words of Christ. Wherefore, I said unto you, feast upon the words of Christ; for behold, the words of Christ will tell you all things what ye should do."}
    },
    {
        "id": "p_c5ab29f6",
        "ref": "2 Nephi 32:8–9",
        "topic": "Pray always",
        "texts": {"lds2013": "And now, my beloved brethren, I perceive that ye ponder still in your hearts; and it grieveth me that I must speak concerning this thing. For if ye would hearken unto the Spirit which teacheth a man to pray, ye would know that ye must pray; for the evil spirit teacheth not a man to pray, but teacheth him that he must not pray. But behold, I say unto you that ye must pray always, and not faint; that ye must not perform any thing unto the Lord save in the first place ye shall pray unto the Father in the name of Christ, that he will consecrate thy performance unto thee, that thy performance may be for the welfare of thy soul."}
    },
    {
        "id": "p_e0405241",
        "ref": "Jacob 2:18–19",
        "topic": "Seek first the kingdom of God",
        "texts": {"lds2013": "But before ye seek for riches, seek ye for the kingdom of God. And after ye have obtained a hope in Christ ye shall obtain riches, if ye seek them; and ye will seek them for the intent to do good—to clothe the naked, and to feed the hungry, and to liberate the captive, and administer relief to the sick and the afflicted."}
    },
    {
        "id": "p_a0035b2c",
        "ref": "Mosiah 2:17",
        "topic": "Service to others is service to God",
        "texts": {"lds2013": "And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God."}
    },
    {
        "id": "p_fe20c8c8",
        "ref": "Mosiah 3:19",
        "topic": "Put off the natural man",
        "texts": {"lds2013": "For the natural man is an enemy to God, and has been from the fall of Adam, and will be, forever and ever, unless he yields to the enticings of the Holy Spirit, and putteth off the natural man and becometh a saint through the atonement of Christ the Lord, and becometh as a child, submissive, meek, humble, patient, full of love, willing to submit to all things which the Lord seeth fit to inflict upon him, even as a child doth submit to his father."}
    },
    {
        "id": "p_881d13f6",
        "ref": "Mosiah 4:30",
        "topic": "Watch your thoughts, words, and deeds",
        "texts": {"lds2013": "But this much I can tell you, that if ye do not watch yourselves, and your thoughts, and your words, and your deeds, and observe the commandments of God, and continue in the faith of what ye have heard concerning the coming of our Lord, even unto the end of your lives, ye must perish. And now, O man, remember, and perish not."}
    },
    {
        "id": "p_84f05c78",
        "ref": "Alma 32:21",
        "topic": "Faith is hope in things not seen",
        "texts": {"lds2013": "And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true."}
    },
    {
        "id": "p_32640315",
        "ref": "Alma 34:32–34",
        "topic": "This life is the time to prepare",
        "texts": {"lds2013": "For behold, this life is the time for men to prepare to meet God; yea, behold the day of this life is the day for men to perform their labors. And now, as I said unto you before, as ye have had so many witnesses, therefore, I beseech of you that ye do not procrastinate the day of your repentance until the end; for after this day of life, which is given us to prepare for eternity, behold, if we do not improve our time while in this life, then cometh the night of darkness wherein there can be no labor performed. Ye cannot say, when ye are brought to that awful crisis, that I will repent, that I will return to my God. Nay, ye cannot say this; for that same spirit which doth possess your bodies at the time that ye go out of this life, that same spirit will have power to possess your body in that eternal world."}
    },
    {
        "id": "p_09def662",
        "ref": "Alma 37:6–7",
        "topic": "Small and simple things",
        "texts": {"lds2013": "Now ye may suppose that this is foolishness in me; but behold I say unto you, that by small and simple things are great things brought to pass; and small means in many instances doth confound the wise. And the Lord God doth work by means to bring about his great and eternal purposes; and by very small means the Lord doth confound the wise and bringeth about the salvation of many souls."}
    },
    {
        "id": "p_a18a2a74",
        "ref": "Alma 37:35",
        "topic": "Learn wisdom in thy youth",
        "texts": {"lds2013": "O, remember, my son, and learn wisdom in thy youth; yea, learn in thy youth to keep the commandments of God."}
    },
    {
        "id": "p_b26d10ae",
        "ref": "Alma 41:10",
        "topic": "Wickedness never was happiness",
        "texts": {"lds2013": "Do not suppose, because it has been spoken concerning restoration, that ye shall be restored from sin to happiness. Behold, I say unto you, wickedness never was happiness."}
    },
    {
        "id": "p_d3fb452d",
        "ref": "Helaman 5:12",
        "topic": "Build on the rock of our Redeemer",
        "texts": {"lds2013": "And now, my sons, remember, remember that it is upon the rock of our Redeemer, who is Christ, the Son of God, that ye must build your foundation; that when the devil shall send forth his mighty winds, yea, his shafts in the whirlwind, yea, when all his hail and his mighty storm shall beat upon you, it shall have no power over you to drag you down to the gulf of misery and endless wo, because of the rock upon which ye are built, which is a sure foundation, a foundation whereon if men build they cannot fall."}
    },
    {
        "id": "p_fdb95a1a",
        "ref": "3 Nephi 11:29",
        "topic": "The spirit of contention",
        "texts": {"lds2013": "For verily, verily I say unto you, he that hath the spirit of contention is not of me, but is of the devil, who is the father of contention, and he stirreth up the hearts of men to contend with anger, one with another."}
    },
    {
        "id": "p_8f3400cd",
        "ref": "3 Nephi 27:27",
        "topic": "Even as I am",
        "texts": {"lds2013": "And know ye that ye shall be judges of this people, according to the judgment which I shall give unto you, which shall be just. Therefore, what manner of men ought ye to be? Verily I say unto you, even as I am."}
    },
    {
        "id": "p_e1de7020",
        "ref": "Ether 12:6",
        "topic": "After the trial of your faith",
        "texts": {"lds2013": "And now, I, Moroni, would speak somewhat concerning these things; I would show unto the world that faith is things which are hoped for and not seen; wherefore, dispute not because ye see not, for ye receive no witness until after the trial of your faith."}
    },
    {
        "id": "p_a0936c91",
        "ref": "Ether 12:27",
        "topic": "Weak things become strong",
        "texts": {"lds2013": "And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me; for if they humble themselves before me, and have faith in me, then will I make weak things become strong unto them."}
    },
    {
        "id": "p_82fa62cb",
        "ref": "Moroni 7:16–17",
        "topic": "Judge good from evil",
        "texts": {"lds2013": "For behold, the Spirit of Christ is given to every man, that he may know good from evil; wherefore, I show unto you the way to judge; for every thing which inviteth to do good, and to persuade to believe in Christ, is sent forth by the power and gift of Christ; wherefore ye may know with a perfect knowledge it is of God. But whatsoever thing persuadeth men to do evil, and believe not in Christ, and deny him, and serve not God, then ye may know with a perfect knowledge it is of the devil; for after this manner doth the devil work, for he persuadeth no man to do good, no, not one; neither do his angels; neither do they who subject themselves unto him."}
    },
    {
        "id": "p_d72eb471",
        "ref": "Moroni 7:45",
        "topic": "Charity suffereth long",
        "texts": {"lds2013": "And charity suffereth long, and is kind, and envieth not, and is not puffed up, seeketh not her own, is not easily provoked, thinketh no evil, and rejoiceth not in iniquity but rejoiceth in the truth, beareth all things, believeth all things, hopeth all things, endureth all things."}
    },
    {
        "id": "p_6d0e1c9a",
        "ref": "Moroni 10:4–5",
        "topic": "By the power of the Holy Ghost",
        "texts": {"lds2013": "And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost. And by the power of the Holy Ghost ye may know the truth of all things."}
    }
    ]
  },
  {
    campaign: {
      id:"camp_retired_dc", track:"seminary",
      name:"The Restoration Tower", shortName:"Doctrine and Covenants",
      subtitle:"Retired Verses of Scripture Mastery",
      towerArt:{kit:"restoration-temple", baseWidth:585},
      hue:"#f4b942", soft:"rgba(244,185,66,.22)", icon:"🗝️",
      tag:"Line upon line, key by key.", order:3, status:"active"
    },
    passages: [
      {
          "id": "p_1eea30a4",
          "ref": "Joseph Smith—History 1:15–20",
          "topic": "The First Vision",
          "texts": {"lds2013": "After I had retired to the place where I had previously designed to go, having looked around me, and finding myself alone, I kneeled down and began to offer up the desires of my heart to God. I had scarcely done so, when immediately I was seized upon by some power which entirely overcame me, and had such an astonishing influence over me as to bind my tongue so that I could not speak. Thick darkness gathered around me, and it seemed to me for a time as if I were doomed to sudden destruction. But, exerting all my powers to call upon God to deliver me out of the power of this enemy which had seized upon me, and at the very moment when I was ready to sink into despair and abandon myself to destruction—not to an imaginary ruin, but to the power of some actual being from the unseen world, who had such marvelous power as I had never before felt in any being—just at this moment of great alarm, I saw a pillar of light exactly over my head, above the brightness of the sun, which descended gradually until it fell upon me. It no sooner appeared than I found myself delivered from the enemy which held me bound. When the light rested upon me I saw two Personages, whose brightness and glory defy all description, standing above me in the air. One of them spake unto me, calling me by name and said, pointing to the other—This is My Beloved Son. Hear Him! My object in going to inquire of the Lord was to know which of all the sects was right, that I might know which to join. No sooner, therefore, did I get possession of myself, so as to be able to speak, than I asked the Personages who stood above me in the light, which of all the sects was right (for at this time it had never entered into my heart that all were wrong)—and which I should join. I was answered that I must join none of them, for they were all wrong; and the Personage who addressed me said that all their creeds were an abomination in his sight; that those professors were all corrupt; that: “they draw near to me with their lips, but their hearts are far from me, they teach for doctrines the commandments of men, having a form of godliness, but they deny the power thereof.” He again forbade me to join with any of them; and many other things did he say unto me, which I cannot write at this time. When I came to myself again, I found myself lying on my back, looking up into heaven. When the light had departed, I had no strength; but soon recovering in some degree, I went home. And as I leaned up to the fireplace, mother inquired what the matter was. I replied, “Never mind, all is well—I am well enough off.” I then said to my mother, “I have learned for myself that Presbyterianism is not true.” It seems as though the adversary was aware, at a very early period of my life, that I was destined to prove a disturber and an annoyer of his kingdom; else why should the powers of darkness combine against me? Why the opposition and persecution that arose against me, almost in my infancy?"}
      },
      {
          "id": "p_1cf52779",
          "ref": "D&C 1:37–38",
          "topic": "His word shall not pass away",
          "texts": {"lds2013": "Search these commandments, for they are true and faithful, and the prophecies and promises which are in them shall all be fulfilled. What I the Lord have spoken, I have spoken, and I excuse not myself; and though the heavens and the earth pass away, my word shall not pass away, but shall all be fulfilled, whether by mine own voice or by the voice of my servants, it is the same."}
      },
      {
          "id": "p_66e12a62",
          "ref": "D&C 8:2–3",
          "topic": "The spirit of revelation",
          "texts": {"lds2013": "Yea, behold, I will tell you in your mind and in your heart, by the Holy Ghost, which shall come upon you and which shall dwell in your heart. Now, behold, this is the spirit of revelation; behold, this is the spirit by which Moses brought the children of Israel through the Red Sea on dry ground."}
      },
      {
          "id": "p_da18c66e",
          "ref": "D&C 10:5",
          "topic": "Pray always",
          "texts": {"lds2013": "Pray always, that you may come off conqueror; yea, that you may conquer Satan, and that you may escape the hands of the servants of Satan that do uphold his work."}
      },
      {
          "id": "p_affb1c2d",
          "ref": "D&C 14:7",
          "topic": "Eternal life is the greatest gift",
          "texts": {"lds2013": "And, if you keep my commandments and endure to the end you shall have eternal life, which gift is the greatest of all the gifts of God."}
      },
      {
          "id": "p_e4d8e807",
          "ref": "D&C 18:10, 15–16",
          "topic": "The worth of souls and missionary joy",
          "texts": {"lds2013": "Remember the worth of souls is great in the sight of God; And if it so be that you should labor all your days in crying repentance unto this people, and bring, save it be one soul unto me, how great shall be your joy with him in the kingdom of my Father! And now, if your joy will be great with one soul that you have brought unto me into the kingdom of my Father, how great will be your joy if you should bring many souls unto me!"}
      },
      {
          "id": "p_f4779c18",
          "ref": "D&C 19:16–19",
          "topic": "He suffered for all",
          "texts": {"lds2013": "For behold, I, God, have suffered these things for all, that they might not suffer if they would repent; But if they would not repent they must suffer even as I; Which suffering caused myself, even God, the greatest of all, to tremble because of pain, and to bleed at every pore, and to suffer both body and spirit—and would that I might not drink the bitter cup, and shrink— Nevertheless, glory be to the Father, and I partook and finished my preparations unto the children of men."}
      },
      {
          "id": "p_40af7a30",
          "ref": "D&C 25:12",
          "topic": "The song of the righteous",
          "texts": {"lds2013": "For my soul delighteth in the song of the heart; yea, the song of the righteous is a prayer unto me, and it shall be answered with a blessing upon their heads."}
      },
      {
          "id": "p_0ac5bc24",
          "ref": "D&C 58:26–27",
          "topic": "Anxiously engaged in a good cause",
          "texts": {"lds2013": "For behold, it is not meet that I should command in all things; for he that is compelled in all things, the same is a slothful and not a wise servant; wherefore he receiveth no reward. Verily I say, men should be anxiously engaged in a good cause, and do many things of their own free will, and bring to pass much righteousness;"}
      },
      {
          "id": "p_f633a1de",
          "ref": "D&C 58:42–43",
          "topic": "Confess and forsake sins",
          "texts": {"lds2013": "Behold, he who has repented of his sins, the same is forgiven, and I, the Lord, remember them no more. By this ye may know if a man repenteth of his sins—behold, he will confess them and forsake them."}
      },
      {
          "id": "p_45120be8",
          "ref": "D&C 59:9–10",
          "topic": "The Sabbath day",
          "texts": {"lds2013": "And that thou mayest more fully keep thyself unspotted from the world, thou shalt go to the house of prayer and offer up thy sacraments upon my holy day; For verily this is a day appointed unto you to rest from your labors, and to pay thy devotions unto the Most High;"}
      },
      {
          "id": "p_19725abc",
          "ref": "D&C 64:9–11",
          "topic": "Required to forgive all men",
          "texts": {"lds2013": "Wherefore, I say unto you, that ye ought to forgive one another; for he that forgiveth not his brother his trespasses standeth condemned before the Lord; for there remaineth in him the greater sin. I, the Lord, will forgive whom I will forgive, but of you it is required to forgive all men. And ye ought to say in your hearts—let God judge between me and thee, and reward thee according to thy deeds."}
      },
      {
          "id": "p_89837859",
          "ref": "D&C 64:23",
          "topic": "Tithing and sacrifice",
          "texts": {"lds2013": "Behold, now it is called today until the coming of the Son of Man, and verily it is a day of sacrifice, and a day for the tithing of my people; for he that is tithed shall not be burned at his coming."}
      },
      {
          "id": "p_fb22edff",
          "ref": "D&C 76:22–24",
          "topic": "He lives! Testimony of Christ",
          "texts": {"lds2013": "And now, after the many testimonies which have been given of him, this is the testimony, last of all, which we give of him: That he lives! For we saw him, even on the right hand of God; and we heard the voice bearing record that he is the Only Begotten of the Father— That by him, and through him, and of him, the worlds are and were created, and the inhabitants thereof are begotten sons and daughters unto God."}
      },
      {
          "id": "p_a9b690d8",
          "ref": "D&C 82:3",
          "topic": "Much given, much required",
          "texts": {"lds2013": "For of him unto whom much is given much is required; and he who sins against the greater light shall receive the greater condemnation."}
      },
      {
          "id": "p_2c7900d4",
          "ref": "D&C 82:10",
          "topic": "I, the Lord, am bound",
          "texts": {"lds2013": "I, the Lord, am bound when ye do what I say; but when ye do not what I say, ye have no promise."}
      },
      {
          "id": "p_3b938a74",
          "ref": "D&C 84:33–39",
          "topic": "Oath and covenant of the priesthood",
          "texts": {"lds2013": "For whoso is faithful unto the obtaining these two priesthoods of which I have spoken, and the magnifying their calling, are sanctified by the Spirit unto the renewing of their bodies. They become the sons of Moses and of Aaron and the seed of Abraham, and the church and kingdom, and the elect of God. And also all they who receive this priesthood receive me, saith the Lord; For he that receiveth my servants receiveth me; And he that receiveth me receiveth my Father; And he that receiveth my Father receiveth my Father’s kingdom; therefore all that my Father hath shall be given unto him. And this is according to the oath and covenant which belongeth to the priesthood."}
      },
      {
          "id": "p_0d5db480",
          "ref": "D&C 88:123–24",
          "topic": "Love one another and arise early",
          "texts": {"lds2013": "See that ye love one another; cease to be covetous; learn to impart one to another as the gospel requires. Cease to be idle; cease to be unclean; cease to find fault one with another; cease to sleep longer than is needful; retire to thy bed early, that ye may not be weary; arise early, that your bodies and your minds may be invigorated."}
      },
      {
          "id": "p_f27155c7",
          "ref": "D&C 89:18–21",
          "topic": "Word of Wisdom blessings",
          "texts": {"lds2013": "And all saints who remember to keep and do these sayings, walking in obedience to the commandments, shall receive health in their navel and marrow to their bones; And shall find wisdom and great treasures of knowledge, even hidden treasures; And shall run and not be weary, and shall walk and not faint. And I, the Lord, give unto them a promise, that the destroying angel shall pass by them, as the children of Israel, and not slay them. Amen."}
      },
      {
          "id": "p_a264893e",
          "ref": "D&C 121:34–36",
          "topic": "Priesthood power and righteousness",
          "texts": {"lds2013": "Behold, there are many called, but few are chosen. And why are they not chosen? Because their hearts are set so much upon the things of this world, and aspire to the honors of men, that they do not learn this one lesson— That the rights of the priesthood are inseparably connected with the powers of heaven, and that the powers of heaven cannot be controlled nor handled only upon the principles of righteousness."}
      },
      {
          "id": "p_e10a8cea",
          "ref": "D&C 130:18–19",
          "topic": "Intelligence rises with us",
          "texts": {"lds2013": "Whatever principle of intelligence we attain unto in this life, it will rise with us in the resurrection. And if a person gains more knowledge and intelligence in this life through his diligence and obedience than another, he will have so much the advantage in the world to come."}
      },
      {
          "id": "p_8428bb6e",
          "ref": "D&C 130:20–21",
          "topic": "Blessings are predicated on law",
          "texts": {"lds2013": "There is a law, irrevocably decreed in heaven before the foundations of this world, upon which all blessings are predicated— And when we obtain any blessing from God, it is by obedience to that law upon which it is predicated."}
      },
      {
          "id": "p_879d9b99",
          "ref": "D&C 130:22–23",
          "topic": "The Father and the Son have bodies",
          "texts": {"lds2013": "The Father has a body of flesh and bones as tangible as man’s; the Son also; but the Holy Ghost has not a body of flesh and bones, but is a personage of Spirit. Were it not so, the Holy Ghost could not dwell in us. A man may receive the Holy Ghost, and it may descend upon him and not tarry with him."}
      },
      {
          "id": "p_4976d2ab",
          "ref": "D&C 131:1–4",
          "topic": "Celestial marriage",
          "texts": {"lds2013": "In the celestial glory there are three heavens or degrees; And in order to obtain the highest, a man must enter into this order of the priesthood [meaning the new and everlasting covenant of marriage]; And if he does not, he cannot obtain it. He may enter into the other, but that is the end of his kingdom; he cannot have an increase."}
      },
      {
          "id": "p_4e8f5be9",
          "ref": "D&C 137:7–10",
          "topic": "Salvation for the dead and children",
          "texts": {"lds2013": "Thus came the voice of the Lord unto me, saying: All who have died without a knowledge of this gospel, who would have received it if they had been permitted to tarry, shall be heirs of the celestial kingdom of God; Also all that shall die henceforth without a knowledge of it, who would have received it with all their hearts, shall be heirs of that kingdom; For I, the Lord, will judge all men according to their works, according to the desire of their hearts. And I also beheld that all children who die before they arrive at the years of accountability are saved in the celestial kingdom of heaven."}
      }
    ]
  }
];

const SEMINARY_CAMPAIGNS = SEMINARY_CAMPAIGN_CONTENT.map(group=>({
  ...group.campaign,
  passageIds: group.passages.map(p=>p.id)
}));
const SEMINARY_TRACK = {
  id:"seminary",
  name:"Seminary — Scripture Mastery",
  campaignIds:["camp_retired_bom","camp_retired_nt","camp_retired_dc","camp_retired_ot"],
  defaultTranslation:"lds2013",
  extraPacks:[]
};

SQ.registerContentPack({
  id:"seminary-retired-scripture-mastery",
  track:SEMINARY_TRACK,
  campaigns:SEMINARY_CAMPAIGNS,
  passages:SEMINARY_CAMPAIGN_CONTENT.flatMap(group=>group.passages)
});
