/* passages.js
   the DATA literal — 100 passages keyed by volume. T9 splits this per track.
   Extracted verbatim from index.html lines 2405-2918 by T2. */
/* =========================================================
   DATA — Scripture Mastery references, themes, and text.
   ========================================================= */
const DATA = {
  "Old Testament": [
    {
        "ref": "Moses 1:39",
        "theme": "God’s work and glory",
        "text": "For behold, this is my work and my glory—to bring to pass the immortality and eternal life of man."
    },
    {
        "ref": "Moses 7:18",
        "theme": "Zion: one heart and one mind",
        "text": "And the Lord called his people Zion, because they were of one heart and one mind, and dwelt in righteousness; and there was no poor among them."
    },
    {
        "ref": "Abraham 3:22–23",
        "theme": "Chosen before birth",
        "text": "Now the Lord had shown unto me, Abraham, the intelligences that were organized before the world was; and among all these there were many of the noble and great ones; And God saw these souls that they were good, and he stood in the midst of them, and he said: These I will make my rulers; for he stood among those that were spirits, and he saw that they were good; and he said unto me: Abraham, thou art one of them; thou wast chosen before thou wast born."
    },
    {
        "ref": "Genesis 1:26–27",
        "theme": "Created in the image of God",
        "text": "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth. So God created man in his own image, in the image of God created he him; male and female created he them."
    },
    {
        "ref": "Genesis 39:9",
        "theme": "Joseph resists temptation",
        "text": "There is none greater in this house than I; neither hath he kept back any thing from me but thee, because thou art his wife: how then can I do this great wickedness, and sin against God?"
    },
    {
        "ref": "Exodus 20:3–17",
        "theme": "The Ten Commandments",
        "text": "Thou shalt have no other gods before me. Thou shalt not make unto thee any graven image, or any likeness of any thing that is in heaven above, or that is in the earth beneath, or that is in the water under the earth: Thou shalt not bow down thyself to them, nor serve them: for I the Lord thy God am a jealous God, visiting the iniquity of the fathers upon the children unto the third and fourth generation of them that hate me; And shewing mercy unto thousands of them that love me, and keep my commandments. Thou shalt not take the name of the Lord thy God in vain; for the Lord will not hold him guiltless that taketh his name in vain. Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it. Honour thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee. Thou shalt not kill. Thou shalt not commit adultery. Thou shalt not steal. Thou shalt not bear false witness against thy neighbour. Thou shalt not covet thy neighbour’s house, thou shalt not covet thy neighbour’s wife, nor his manservant, nor his maidservant, nor his ox, nor his ass, nor any thing that is thy neighbour’s."
    },
    {
        "ref": "Exodus 33:11",
        "theme": "The Lord spake face to face",
        "text": "And the Lord spake unto Moses face to face, as a man speaketh unto his friend. And he turned again into the camp: but his servant Joshua, the son of Nun, a young man, departed not out of the tabernacle."
    },
    {
        "ref": "Leviticus 19:18",
        "theme": "Love thy neighbour as thyself",
        "text": "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself: I am the Lord."
    },
    {
        "ref": "Deuteronomy 7:3–4",
        "theme": "Do not turn from following the Lord",
        "text": "Neither shalt thou make marriages with them; thy daughter thou shalt not give unto his son, nor his daughter shalt thou take unto thy son. For they will turn away thy son from following me, that they may serve other gods: so will the anger of the Lord be kindled against you, and destroy thee suddenly."
    },
    {
        "ref": "Joshua 1:8",
        "theme": "Meditate in the law day and night",
        "text": "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success."
    },
    {
        "ref": "Joshua 24:15",
        "theme": "Choose you this day whom ye will serve",
        "text": "And if it seem evil unto you to serve the Lord, choose you this day whom ye will serve; whether the gods which your fathers served that were on the other side of the flood, or the gods of the Amorites, in whose land ye dwell: but as for me and my house, we will serve the Lord."
    },
    {
        "ref": "1 Samuel 16:7",
        "theme": "The Lord looketh on the heart",
        "text": "But the Lord said unto Samuel, Look not on his countenance, or on the height of his stature; because I have refused him: for the Lord seeth not as man seeth; for man looketh on the outward appearance, but the Lord looketh on the heart."
    },
    {
        "ref": "Job 19:25–26",
        "theme": "I know that my Redeemer liveth",
        "text": "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth: And though after my skin worms destroy this body, yet in my flesh shall I see God:"
    },
    {
        "ref": "Psalm 24:3–4",
        "theme": "Clean hands and a pure heart",
        "text": "Who shall ascend into the hill of the Lord? or who shall stand in his holy place? He that hath clean hands, and a pure heart; who hath not lifted up his soul unto vanity, nor sworn deceitfully."
    },
    {
        "ref": "Proverbs 3:5–6",
        "theme": "Trust in the Lord",
        "text": "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."
    },
    {
        "ref": "Isaiah 1:18",
        "theme": "Though your sins be as scarlet",
        "text": "Come now, and let us reason together, saith the Lord: though your sins be as scarlet, they shall be as white as snow; though they be red like crimson, they shall be as wool."
    },
    {
        "ref": "Isaiah 29:13–14",
        "theme": "A marvellous work and a wonder",
        "text": "Wherefore the Lord said, Forasmuch as this people draw near me with their mouth, and with their lips do honour me, but have removed their heart far from me, and their fear toward me is taught by the precept of men: Therefore, behold, I will proceed to do a marvellous work among this people, even a marvellous work and a wonder: for the wisdom of their wise men shall perish, and the understanding of their prudent men shall be hid."
    },
    {
        "ref": "Isaiah 53:3–5",
        "theme": "With his stripes we are healed",
        "text": "He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not. Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed."
    },
    {
        "ref": "Isaiah 55:8–9",
        "theme": "My ways are higher than your ways",
        "text": "For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord. For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts."
    },
    {
        "ref": "Jeremiah 16:16",
        "theme": "Fishers and hunters",
        "text": "Behold, I will send for many fishers, saith the Lord, and they shall fish them; and after will I send for many hunters, and they shall hunt them from every mountain, and from every hill, and out of the holes of the rocks."
    },
    {
        "ref": "Ezekiel 37:15–17",
        "theme": "The sticks of Judah and Joseph",
        "text": "The word of the Lord came again unto me, saying, Moreover, thou son of man, take thee one stick, and write upon it, For Judah, and for the children of Israel his companions: then take another stick, and write upon it, For Joseph, the stick of Ephraim, and for all the house of Israel his companions: And join them one to another into one stick; and they shall become one in thine hand."
    },
    {
        "ref": "Daniel 2:44–45",
        "theme": "The kingdom that shall stand forever",
        "text": "And in the days of these kings shall the God of heaven set up a kingdom, which shall never be destroyed: and the kingdom shall not be left to other people, but it shall break in pieces and consume all these kingdoms, and it shall stand for ever. Forasmuch as thou sawest that the stone was cut out of the mountain without hands, and that it brake in pieces the iron, the brass, the clay, the silver, and the gold; the great God hath made known to the king what shall come to pass hereafter: and the dream is certain, and the interpretation thereof sure."
    },
    {
        "ref": "Amos 3:7",
        "theme": "The Lord reveals His secret to prophets",
        "text": "Surely the Lord God will do nothing, but he revealeth his secret unto his servants the prophets."
    },
    {
        "ref": "Malachi 3:8–10",
        "theme": "Tithes and offerings",
        "text": "Will a man rob God? Yet ye have robbed me. But ye say, Wherein have we robbed thee? In tithes and offerings. Ye are cursed with a curse: for ye have robbed me, even this whole nation. Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it."
    },
    {
        "ref": "Malachi 4:5–6",
        "theme": "Elijah turns hearts",
        "text": "Behold, I will send you Elijah the prophet before the coming of the great and dreadful day of the Lord: And he shall turn the heart of the fathers to the children, and the heart of the children to their fathers, lest I come and smite the earth with a curse."
    }
],
  "New Testament": [
    {
        "ref": "Matthew 5:14–16",
        "theme": "Ye are the light of the world",
        "text": "Ye are the light of the world. A city that is set on an hill cannot be hid. Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house. Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven."
    },
    {
        "ref": "Matthew 6:24",
        "theme": "Ye cannot serve God and mammon",
        "text": "No man can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot serve God and mammon."
    },
    {
        "ref": "Matthew 16:15–19",
        "theme": "The keys of the kingdom",
        "text": "He saith unto them, But whom say ye that I am? And Simon Peter answered and said, Thou art the Christ, the Son of the living God. And Jesus answered and said unto him, Blessed art thou, Simon Bar-jona: for flesh and blood hath not revealed it unto thee, but my Father which is in heaven. And I say also unto thee, That thou art Peter, and upon this rock I will build my church; and the gates of hell shall not prevail against it. And I will give unto thee the keys of the kingdom of heaven: and whatsoever thou shalt bind on earth shall be bound in heaven: and whatsoever thou shalt loose on earth shall be loosed in heaven."
    },
    {
        "ref": "Matthew 25:40",
        "theme": "Inasmuch as ye have done it unto one of the least",
        "text": "And the King shall answer and say unto them, Verily I say unto you, Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me."
    },
    {
        "ref": "Luke 24:36–39",
        "theme": "A spirit hath not flesh and bones",
        "text": "And as they thus spake, Jesus himself stood in the midst of them, and saith unto them, Peace be unto you. But they were terrified and affrighted, and supposed that they had seen a spirit. And he said unto them, Why are ye troubled? and why do thoughts arise in your hearts? Behold my hands and my feet, that it is I myself: handle me, and see; for a spirit hath not flesh and bones, as ye see me have."
    },
    {
        "ref": "John 3:5",
        "theme": "Born of water and of the Spirit",
        "text": "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God."
    },
    {
        "ref": "John 7:17",
        "theme": "Testing doctrine by doing",
        "text": "If any man will do his will, he shall know of the doctrine, whether it be of God, or whether I speak of myself."
    },
    {
        "ref": "John 10:16",
        "theme": "Other sheep I have",
        "text": "And other sheep I have, which are not of this fold: them also I must bring, and they shall hear my voice; and there shall be one fold, and one shepherd."
    },
    {
        "ref": "John 14:15",
        "theme": "If ye love me, keep my commandments",
        "text": "If ye love me, keep my commandments."
    },
    {
        "ref": "John 17:3",
        "theme": "This is life eternal",
        "text": "And this is life eternal, that they might know thee the only true God, and Jesus Christ, whom thou hast sent."
    },
    {
        "ref": "Acts 7:55–56",
        "theme": "Stephen saw the Father and the Son",
        "text": "But he, being full of the Holy Ghost, looked up steadfastly into heaven, and saw the glory of God, and Jesus standing on the right hand of God, And said, Behold, I see the heavens opened, and the Son of man standing on the right hand of God."
    },
    {
        "ref": "Romans 1:16",
        "theme": "Not ashamed of the gospel",
        "text": "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek."
    },
    {
        "ref": "1 Corinthians 10:13",
        "theme": "God will make a way to escape",
        "text": "There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it."
    },
    {
        "ref": "1 Corinthians 15:20–22",
        "theme": "The Resurrection through Christ",
        "text": "But now is Christ risen from the dead, and become the firstfruits of them that slept. For since by man came death, by man came also the resurrection of the dead. For as in Adam all die, even so in Christ shall all be made alive."
    },
    {
        "ref": "1 Corinthians 15:29",
        "theme": "Baptism for the dead",
        "text": "Else what shall they do which are baptized for the dead, if the dead rise not at all? why are they then baptized for the dead?"
    },
    {
        "ref": "1 Corinthians 15:40–42",
        "theme": "Degrees of glory",
        "text": "There are also celestial bodies, and bodies terrestrial: but the glory of the celestial is one, and the glory of the terrestrial is another. There is one glory of the sun, and another glory of the moon, and another glory of the stars: for one star differeth from another star in glory. So also is the resurrection of the dead. It is sown in corruption; it is raised in incorruption:"
    },
    {
        "ref": "Ephesians 4:11–14",
        "theme": "Why the Church is organized",
        "text": "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ: Till we all come in the unity of the faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the stature of the fulness of Christ: That we henceforth be no more children, tossed to and fro, and carried about with every wind of doctrine, by the sleight of men, and cunning craftiness, whereby they lie in wait to deceive;"
    },
    {
        "ref": "2 Thessalonians 2:1–3",
        "theme": "There shall come a falling away first",
        "text": "Now we beseech you, brethren, by the coming of our Lord Jesus Christ, and by our gathering together unto him, That ye be not soon shaken in mind, or be troubled, neither by spirit, nor by word, nor by letter as from us, as that the day of Christ is at hand. Let no man deceive you by any means: for that day shall not come, except there come a falling away first, and that man of sin be revealed, the son of perdition;"
    },
    {
        "ref": "2 Timothy 3:1–5",
        "theme": "Perilous times shall come",
        "text": "This know also, that in the last days perilous times shall come. For men shall be lovers of their own selves, covetous, boasters, proud, blasphemers, disobedient to parents, unthankful, unholy, Without natural affection, trucebreakers, false accusers, incontinent, fierce, despisers of those that are good, Traitors, heady, highminded, lovers of pleasures more than lovers of God; Having a form of godliness, but denying the power thereof: from such turn away."
    },
    {
        "ref": "2 Timothy 3:16–17",
        "theme": "All scripture is given by inspiration of God",
        "text": "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, throughly furnished unto all good works."
    },
    {
        "ref": "Hebrews 5:4",
        "theme": "Called of God, as was Aaron",
        "text": "And no man taketh this honour unto himself, but he that is called of God, as was Aaron."
    },
    {
        "ref": "James 1:5–6",
        "theme": "Ask of God in faith",
        "text": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him. But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed."
    },
    {
        "ref": "James 2:17–18",
        "theme": "Faith without works is dead",
        "text": "Even so faith, if it hath not works, is dead, being alone. Yea, a man may say, Thou hast faith, and I have works: shew me thy faith without thy works, and I will shew thee my faith by my works."
    },
    {
        "ref": "Revelation 14:6–7",
        "theme": "The everlasting gospel",
        "text": "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people, Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters."
    },
    {
        "ref": "Revelation 20:12–13",
        "theme": "Judged according to their works",
        "text": "And I saw the dead, small and great, stand before God; and the books were opened: and another book was opened, which is the book of life: and the dead were judged out of those things which were written in the books, according to their works. And the sea gave up the dead which were in it; and death and hell delivered up the dead which were in them: and they were judged every man according to their works."
    }
],
  "Book of Mormon": [
    {
        "ref": "1 Nephi 3:7",
        "theme": "I will go and do",
        "text": "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them."
    },
    {
        "ref": "1 Nephi 19:23",
        "theme": "Liken all scriptures unto us",
        "text": "And I did read many things unto them which were written in the books of Moses; but that I might more fully persuade them to believe in the Lord their Redeemer I did read unto them that which was written by the prophet Isaiah; for I did liken all scriptures unto us, that it might be for our profit and learning."
    },
    {
        "ref": "2 Nephi 2:25",
        "theme": "Men are, that they might have joy",
        "text": "Adam fell that men might be; and men are, that they might have joy."
    },
    {
        "ref": "2 Nephi 2:27",
        "theme": "Free to choose liberty and eternal life",
        "text": "Wherefore, men are free according to the flesh; and all things are given them which are expedient unto man. And they are free to choose liberty and eternal life, through the great Mediator of all men, or to choose captivity and death, according to the captivity and power of the devil; for he seeketh that all men might be miserable like unto himself."
    },
    {
        "ref": "2 Nephi 9:28–29",
        "theme": "To be learned is good",
        "text": "O that cunning plan of the evil one! O the vainness, and the frailties, and the foolishness of men! When they are learned they think they are wise, and they hearken not unto the counsel of God, for they set it aside, supposing they know of themselves, wherefore, their wisdom is foolishness and it profiteth them not. And they shall perish. But to be learned is good if they hearken unto the counsels of God."
    },
    {
        "ref": "2 Nephi 28:7–9",
        "theme": "False and vain doctrines",
        "text": "Yea, and there shall be many which shall say: Eat, drink, and be merry, for tomorrow we die; and it shall be well with us. And there shall also be many which shall say: Eat, drink, and be merry; nevertheless, fear God—he will justify in committing a little sin; yea, lie a little, take the advantage of one because of his words, dig a pit for thy neighbor; there is no harm in this; and do all these things, for tomorrow we die; and if it so be that we are guilty, God will beat us with a few stripes, and at last we shall be saved in the kingdom of God. Yea, and there shall be many which shall teach after this manner, false and vain and foolish doctrines, and shall be puffed up in their hearts, and shall seek deep to hide their counsels from the Lord; and their works shall be in the dark."
    },
    {
        "ref": "2 Nephi 32:3",
        "theme": "Feast upon the words of Christ",
        "text": "Angels speak by the power of the Holy Ghost; wherefore, they speak the words of Christ. Wherefore, I said unto you, feast upon the words of Christ; for behold, the words of Christ will tell you all things what ye should do."
    },
    {
        "ref": "2 Nephi 32:8–9",
        "theme": "Pray always",
        "text": "And now, my beloved brethren, I perceive that ye ponder still in your hearts; and it grieveth me that I must speak concerning this thing. For if ye would hearken unto the Spirit which teacheth a man to pray, ye would know that ye must pray; for the evil spirit teacheth not a man to pray, but teacheth him that he must not pray. But behold, I say unto you that ye must pray always, and not faint; that ye must not perform any thing unto the Lord save in the first place ye shall pray unto the Father in the name of Christ, that he will consecrate thy performance unto thee, that thy performance may be for the welfare of thy soul."
    },
    {
        "ref": "Jacob 2:18–19",
        "theme": "Seek first the kingdom of God",
        "text": "But before ye seek for riches, seek ye for the kingdom of God. And after ye have obtained a hope in Christ ye shall obtain riches, if ye seek them; and ye will seek them for the intent to do good—to clothe the naked, and to feed the hungry, and to liberate the captive, and administer relief to the sick and the afflicted."
    },
    {
        "ref": "Mosiah 2:17",
        "theme": "Service to others is service to God",
        "text": "And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God."
    },
    {
        "ref": "Mosiah 3:19",
        "theme": "Put off the natural man",
        "text": "For the natural man is an enemy to God, and has been from the fall of Adam, and will be, forever and ever, unless he yields to the enticings of the Holy Spirit, and putteth off the natural man and becometh a saint through the atonement of Christ the Lord, and becometh as a child, submissive, meek, humble, patient, full of love, willing to submit to all things which the Lord seeth fit to inflict upon him, even as a child doth submit to his father."
    },
    {
        "ref": "Mosiah 4:30",
        "theme": "Watch your thoughts, words, and deeds",
        "text": "But this much I can tell you, that if ye do not watch yourselves, and your thoughts, and your words, and your deeds, and observe the commandments of God, and continue in the faith of what ye have heard concerning the coming of our Lord, even unto the end of your lives, ye must perish. And now, O man, remember, and perish not."
    },
    {
        "ref": "Alma 32:21",
        "theme": "Faith is hope in things not seen",
        "text": "And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true."
    },
    {
        "ref": "Alma 34:32–34",
        "theme": "This life is the time to prepare",
        "text": "For behold, this life is the time for men to prepare to meet God; yea, behold the day of this life is the day for men to perform their labors. And now, as I said unto you before, as ye have had so many witnesses, therefore, I beseech of you that ye do not procrastinate the day of your repentance until the end; for after this day of life, which is given us to prepare for eternity, behold, if we do not improve our time while in this life, then cometh the night of darkness wherein there can be no labor performed. Ye cannot say, when ye are brought to that awful crisis, that I will repent, that I will return to my God. Nay, ye cannot say this; for that same spirit which doth possess your bodies at the time that ye go out of this life, that same spirit will have power to possess your body in that eternal world."
    },
    {
        "ref": "Alma 37:6–7",
        "theme": "Small and simple things",
        "text": "Now ye may suppose that this is foolishness in me; but behold I say unto you, that by small and simple things are great things brought to pass; and small means in many instances doth confound the wise. And the Lord God doth work by means to bring about his great and eternal purposes; and by very small means the Lord doth confound the wise and bringeth about the salvation of many souls."
    },
    {
        "ref": "Alma 37:35",
        "theme": "Learn wisdom in thy youth",
        "text": "O, remember, my son, and learn wisdom in thy youth; yea, learn in thy youth to keep the commandments of God."
    },
    {
        "ref": "Alma 41:10",
        "theme": "Wickedness never was happiness",
        "text": "Do not suppose, because it has been spoken concerning restoration, that ye shall be restored from sin to happiness. Behold, I say unto you, wickedness never was happiness."
    },
    {
        "ref": "Helaman 5:12",
        "theme": "Build on the rock of our Redeemer",
        "text": "And now, my sons, remember, remember that it is upon the rock of our Redeemer, who is Christ, the Son of God, that ye must build your foundation; that when the devil shall send forth his mighty winds, yea, his shafts in the whirlwind, yea, when all his hail and his mighty storm shall beat upon you, it shall have no power over you to drag you down to the gulf of misery and endless wo, because of the rock upon which ye are built, which is a sure foundation, a foundation whereon if men build they cannot fall."
    },
    {
        "ref": "3 Nephi 11:29",
        "theme": "The spirit of contention",
        "text": "For verily, verily I say unto you, he that hath the spirit of contention is not of me, but is of the devil, who is the father of contention, and he stirreth up the hearts of men to contend with anger, one with another."
    },
    {
        "ref": "3 Nephi 27:27",
        "theme": "Even as I am",
        "text": "And know ye that ye shall be judges of this people, according to the judgment which I shall give unto you, which shall be just. Therefore, what manner of men ought ye to be? Verily I say unto you, even as I am."
    },
    {
        "ref": "Ether 12:6",
        "theme": "After the trial of your faith",
        "text": "And now, I, Moroni, would speak somewhat concerning these things; I would show unto the world that faith is things which are hoped for and not seen; wherefore, dispute not because ye see not, for ye receive no witness until after the trial of your faith."
    },
    {
        "ref": "Ether 12:27",
        "theme": "Weak things become strong",
        "text": "And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me; for if they humble themselves before me, and have faith in me, then will I make weak things become strong unto them."
    },
    {
        "ref": "Moroni 7:16–17",
        "theme": "Judge good from evil",
        "text": "For behold, the Spirit of Christ is given to every man, that he may know good from evil; wherefore, I show unto you the way to judge; for every thing which inviteth to do good, and to persuade to believe in Christ, is sent forth by the power and gift of Christ; wherefore ye may know with a perfect knowledge it is of God. But whatsoever thing persuadeth men to do evil, and believe not in Christ, and deny him, and serve not God, then ye may know with a perfect knowledge it is of the devil; for after this manner doth the devil work, for he persuadeth no man to do good, no, not one; neither do his angels; neither do they who subject themselves unto him."
    },
    {
        "ref": "Moroni 7:45",
        "theme": "Charity suffereth long",
        "text": "And charity suffereth long, and is kind, and envieth not, and is not puffed up, seeketh not her own, is not easily provoked, thinketh no evil, and rejoiceth not in iniquity but rejoiceth in the truth, beareth all things, believeth all things, hopeth all things, endureth all things."
    },
    {
        "ref": "Moroni 10:4–5",
        "theme": "By the power of the Holy Ghost",
        "text": "And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost. And by the power of the Holy Ghost ye may know the truth of all things."
    }
],
  "Doctrine and Covenants": [
      {
          "ref": "Joseph Smith—History 1:15–20",
          "theme": "The First Vision",
          "text": "After I had retired to the place where I had previously designed to go, having looked around me, and finding myself alone, I kneeled down and began to offer up the desires of my heart to God. I had scarcely done so, when immediately I was seized upon by some power which entirely overcame me, and had such an astonishing influence over me as to bind my tongue so that I could not speak. Thick darkness gathered around me, and it seemed to me for a time as if I were doomed to sudden destruction. But, exerting all my powers to call upon God to deliver me out of the power of this enemy which had seized upon me, and at the very moment when I was ready to sink into despair and abandon myself to destruction—not to an imaginary ruin, but to the power of some actual being from the unseen world, who had such marvelous power as I had never before felt in any being—just at this moment of great alarm, I saw a pillar of light exactly over my head, above the brightness of the sun, which descended gradually until it fell upon me. It no sooner appeared than I found myself delivered from the enemy which held me bound. When the light rested upon me I saw two Personages, whose brightness and glory defy all description, standing above me in the air. One of them spake unto me, calling me by name and said, pointing to the other—This is My Beloved Son. Hear Him! My object in going to inquire of the Lord was to know which of all the sects was right, that I might know which to join. No sooner, therefore, did I get possession of myself, so as to be able to speak, than I asked the Personages who stood above me in the light, which of all the sects was right (for at this time it had never entered into my heart that all were wrong)—and which I should join. I was answered that I must join none of them, for they were all wrong; and the Personage who addressed me said that all their creeds were an abomination in his sight; that those professors were all corrupt; that: “they draw near to me with their lips, but their hearts are far from me, they teach for doctrines the commandments of men, having a form of godliness, but they deny the power thereof.” He again forbade me to join with any of them; and many other things did he say unto me, which I cannot write at this time. When I came to myself again, I found myself lying on my back, looking up into heaven. When the light had departed, I had no strength; but soon recovering in some degree, I went home. And as I leaned up to the fireplace, mother inquired what the matter was. I replied, “Never mind, all is well—I am well enough off.” I then said to my mother, “I have learned for myself that Presbyterianism is not true.” It seems as though the adversary was aware, at a very early period of my life, that I was destined to prove a disturber and an annoyer of his kingdom; else why should the powers of darkness combine against me? Why the opposition and persecution that arose against me, almost in my infancy?"
      },
      {
          "ref": "D&C 1:37–38",
          "theme": "His word shall not pass away",
          "text": "Search these commandments, for they are true and faithful, and the prophecies and promises which are in them shall all be fulfilled. What I the Lord have spoken, I have spoken, and I excuse not myself; and though the heavens and the earth pass away, my word shall not pass away, but shall all be fulfilled, whether by mine own voice or by the voice of my servants, it is the same."
      },
      {
          "ref": "D&C 8:2–3",
          "theme": "The spirit of revelation",
          "text": "Yea, behold, I will tell you in your mind and in your heart, by the Holy Ghost, which shall come upon you and which shall dwell in your heart. Now, behold, this is the spirit of revelation; behold, this is the spirit by which Moses brought the children of Israel through the Red Sea on dry ground."
      },
      {
          "ref": "D&C 10:5",
          "theme": "Pray always",
          "text": "Pray always, that you may come off conqueror; yea, that you may conquer Satan, and that you may escape the hands of the servants of Satan that do uphold his work."
      },
      {
          "ref": "D&C 14:7",
          "theme": "Eternal life is the greatest gift",
          "text": "And, if you keep my commandments and endure to the end you shall have eternal life, which gift is the greatest of all the gifts of God."
      },
      {
          "ref": "D&C 18:10, 15–16",
          "theme": "The worth of souls and missionary joy",
          "text": "Remember the worth of souls is great in the sight of God; And if it so be that you should labor all your days in crying repentance unto this people, and bring, save it be one soul unto me, how great shall be your joy with him in the kingdom of my Father! And now, if your joy will be great with one soul that you have brought unto me into the kingdom of my Father, how great will be your joy if you should bring many souls unto me!"
      },
      {
          "ref": "D&C 19:16–19",
          "theme": "He suffered for all",
          "text": "For behold, I, God, have suffered these things for all, that they might not suffer if they would repent; But if they would not repent they must suffer even as I; Which suffering caused myself, even God, the greatest of all, to tremble because of pain, and to bleed at every pore, and to suffer both body and spirit—and would that I might not drink the bitter cup, and shrink— Nevertheless, glory be to the Father, and I partook and finished my preparations unto the children of men."
      },
      {
          "ref": "D&C 25:12",
          "theme": "The song of the righteous",
          "text": "For my soul delighteth in the song of the heart; yea, the song of the righteous is a prayer unto me, and it shall be answered with a blessing upon their heads."
      },
      {
          "ref": "D&C 58:26–27",
          "theme": "Anxiously engaged in a good cause",
          "text": "For behold, it is not meet that I should command in all things; for he that is compelled in all things, the same is a slothful and not a wise servant; wherefore he receiveth no reward. Verily I say, men should be anxiously engaged in a good cause, and do many things of their own free will, and bring to pass much righteousness;"
      },
      {
          "ref": "D&C 58:42–43",
          "theme": "Confess and forsake sins",
          "text": "Behold, he who has repented of his sins, the same is forgiven, and I, the Lord, remember them no more. By this ye may know if a man repenteth of his sins—behold, he will confess them and forsake them."
      },
      {
          "ref": "D&C 59:9–10",
          "theme": "The Sabbath day",
          "text": "And that thou mayest more fully keep thyself unspotted from the world, thou shalt go to the house of prayer and offer up thy sacraments upon my holy day; For verily this is a day appointed unto you to rest from your labors, and to pay thy devotions unto the Most High;"
      },
      {
          "ref": "D&C 64:9–11",
          "theme": "Required to forgive all men",
          "text": "Wherefore, I say unto you, that ye ought to forgive one another; for he that forgiveth not his brother his trespasses standeth condemned before the Lord; for there remaineth in him the greater sin. I, the Lord, will forgive whom I will forgive, but of you it is required to forgive all men. And ye ought to say in your hearts—let God judge between me and thee, and reward thee according to thy deeds."
      },
      {
          "ref": "D&C 64:23",
          "theme": "Tithing and sacrifice",
          "text": "Behold, now it is called today until the coming of the Son of Man, and verily it is a day of sacrifice, and a day for the tithing of my people; for he that is tithed shall not be burned at his coming."
      },
      {
          "ref": "D&C 76:22–24",
          "theme": "He lives! Testimony of Christ",
          "text": "And now, after the many testimonies which have been given of him, this is the testimony, last of all, which we give of him: That he lives! For we saw him, even on the right hand of God; and we heard the voice bearing record that he is the Only Begotten of the Father— That by him, and through him, and of him, the worlds are and were created, and the inhabitants thereof are begotten sons and daughters unto God."
      },
      {
          "ref": "D&C 82:3",
          "theme": "Much given, much required",
          "text": "For of him unto whom much is given much is required; and he who sins against the greater light shall receive the greater condemnation."
      },
      {
          "ref": "D&C 82:10",
          "theme": "I, the Lord, am bound",
          "text": "I, the Lord, am bound when ye do what I say; but when ye do not what I say, ye have no promise."
      },
      {
          "ref": "D&C 84:33–39",
          "theme": "Oath and covenant of the priesthood",
          "text": "For whoso is faithful unto the obtaining these two priesthoods of which I have spoken, and the magnifying their calling, are sanctified by the Spirit unto the renewing of their bodies. They become the sons of Moses and of Aaron and the seed of Abraham, and the church and kingdom, and the elect of God. And also all they who receive this priesthood receive me, saith the Lord; For he that receiveth my servants receiveth me; And he that receiveth me receiveth my Father; And he that receiveth my Father receiveth my Father’s kingdom; therefore all that my Father hath shall be given unto him. And this is according to the oath and covenant which belongeth to the priesthood."
      },
      {
          "ref": "D&C 88:123–24",
          "theme": "Love one another and arise early",
          "text": "See that ye love one another; cease to be covetous; learn to impart one to another as the gospel requires. Cease to be idle; cease to be unclean; cease to find fault one with another; cease to sleep longer than is needful; retire to thy bed early, that ye may not be weary; arise early, that your bodies and your minds may be invigorated."
      },
      {
          "ref": "D&C 89:18–21",
          "theme": "Word of Wisdom blessings",
          "text": "And all saints who remember to keep and do these sayings, walking in obedience to the commandments, shall receive health in their navel and marrow to their bones; And shall find wisdom and great treasures of knowledge, even hidden treasures; And shall run and not be weary, and shall walk and not faint. And I, the Lord, give unto them a promise, that the destroying angel shall pass by them, as the children of Israel, and not slay them. Amen."
      },
      {
          "ref": "D&C 121:34–36",
          "theme": "Priesthood power and righteousness",
          "text": "Behold, there are many called, but few are chosen. And why are they not chosen? Because their hearts are set so much upon the things of this world, and aspire to the honors of men, that they do not learn this one lesson— That the rights of the priesthood are inseparably connected with the powers of heaven, and that the powers of heaven cannot be controlled nor handled only upon the principles of righteousness."
      },
      {
          "ref": "D&C 130:18–19",
          "theme": "Intelligence rises with us",
          "text": "Whatever principle of intelligence we attain unto in this life, it will rise with us in the resurrection. And if a person gains more knowledge and intelligence in this life through his diligence and obedience than another, he will have so much the advantage in the world to come."
      },
      {
          "ref": "D&C 130:20–21",
          "theme": "Blessings are predicated on law",
          "text": "There is a law, irrevocably decreed in heaven before the foundations of this world, upon which all blessings are predicated— And when we obtain any blessing from God, it is by obedience to that law upon which it is predicated."
      },
      {
          "ref": "D&C 130:22–23",
          "theme": "The Father and the Son have bodies",
          "text": "The Father has a body of flesh and bones as tangible as man’s; the Son also; but the Holy Ghost has not a body of flesh and bones, but is a personage of Spirit. Were it not so, the Holy Ghost could not dwell in us. A man may receive the Holy Ghost, and it may descend upon him and not tarry with him."
      },
      {
          "ref": "D&C 131:1–4",
          "theme": "Celestial marriage",
          "text": "In the celestial glory there are three heavens or degrees; And in order to obtain the highest, a man must enter into this order of the priesthood [meaning the new and everlasting covenant of marriage]; And if he does not, he cannot obtain it. He may enter into the other, but that is the end of his kingdom; he cannot have an increase."
      },
      {
          "ref": "D&C 137:7–10",
          "theme": "Salvation for the dead and children",
          "text": "Thus came the voice of the Lord unto me, saying: All who have died without a knowledge of this gospel, who would have received it if they had been permitted to tarry, shall be heirs of the celestial kingdom of God; Also all that shall die henceforth without a knowledge of it, who would have received it with all their hearts, shall be heirs of that kingdom; For I, the Lord, will judge all men according to their works, according to the desire of their hearts. And I also beheld that all children who die before they arrive at the years of accountability are saved in the celestial kingdom of heaven."
      }
  ],
};

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.DATA = DATA;
