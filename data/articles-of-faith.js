/* articles-of-faith.js — Articles of Faith pack (T10)
   Generated from the official current-edition scripture page. */
const ARTICLES_OF_FAITH_PASSAGES = [
  {
    "id": "p_67a6a04b",
    "ref": "Articles of Faith 1:1",
    "topic": "Article of Faith 1",
    "texts": {
      "lds2013": "We believe in God, the Eternal Father, and in His Son, Jesus Christ, and in the Holy Ghost."
    },
    "source": "builtin"
  },
  {
    "id": "p_89bd3937",
    "ref": "Articles of Faith 1:2",
    "topic": "Article of Faith 2",
    "texts": {
      "lds2013": "We believe that men will be punished for their own sins, and not for Adam’s transgression."
    },
    "source": "builtin"
  },
  {
    "id": "p_3ae020e3",
    "ref": "Articles of Faith 1:3",
    "topic": "Article of Faith 3",
    "texts": {
      "lds2013": "We believe that through the Atonement of Christ, all mankind may be saved, by obedience to the laws and ordinances of the Gospel."
    },
    "source": "builtin"
  },
  {
    "id": "p_c49ad9d1",
    "ref": "Articles of Faith 1:4",
    "topic": "Article of Faith 4",
    "texts": {
      "lds2013": "We believe that the first principles and ordinances of the Gospel are: first, Faith in the Lord Jesus Christ; second, Repentance; third, Baptism by immersion for the remission of sins; fourth, Laying on of hands for the gift of the Holy Ghost."
    },
    "source": "builtin"
  },
  {
    "id": "p_a4c739fe",
    "ref": "Articles of Faith 1:5",
    "topic": "Article of Faith 5",
    "texts": {
      "lds2013": "We believe that a man must be called of God, by prophecy, and by the laying on of hands by those who are in authority, to preach the Gospel and administer in the ordinances thereof."
    },
    "source": "builtin"
  },
  {
    "id": "p_69a93226",
    "ref": "Articles of Faith 1:6",
    "topic": "Article of Faith 6",
    "texts": {
      "lds2013": "We believe in the same organization that existed in the Primitive Church, namely, apostles, prophets, pastors, teachers, evangelists, and so forth."
    },
    "source": "builtin"
  },
  {
    "id": "p_78373ac6",
    "ref": "Articles of Faith 1:7",
    "topic": "Article of Faith 7",
    "texts": {
      "lds2013": "We believe in the gift of tongues, prophecy, revelation, visions, healing, interpretation of tongues, and so forth."
    },
    "source": "builtin"
  },
  {
    "id": "p_f88417cb",
    "ref": "Articles of Faith 1:8",
    "topic": "Article of Faith 8",
    "texts": {
      "lds2013": "We believe the Bible to be the word of God as far as it is translated correctly; we also believe the Book of Mormon to be the word of God."
    },
    "source": "builtin"
  },
  {
    "id": "p_9804282d",
    "ref": "Articles of Faith 1:9",
    "topic": "Article of Faith 9",
    "texts": {
      "lds2013": "We believe all that God has revealed, all that He does now reveal, and we believe that He will yet reveal many great and important things pertaining to the Kingdom of God."
    },
    "source": "builtin"
  },
  {
    "id": "p_44894f85",
    "ref": "Articles of Faith 1:10",
    "topic": "Article of Faith 10",
    "texts": {
      "lds2013": "We believe in the literal gathering of Israel and in the restoration of the Ten Tribes; that Zion (the New Jerusalem) will be built upon the American continent; that Christ will reign personally upon the earth; and, that the earth will be renewed and receive its paradisiacal glory."
    },
    "source": "builtin"
  },
  {
    "id": "p_b615fde6",
    "ref": "Articles of Faith 1:11",
    "topic": "Article of Faith 11",
    "texts": {
      "lds2013": "We claim the privilege of worshiping Almighty God according to the dictates of our own conscience, and allow all men the same privilege, let them worship how, where, or what they may."
    },
    "source": "builtin"
  },
  {
    "id": "p_3813fae7",
    "ref": "Articles of Faith 1:12",
    "topic": "Article of Faith 12",
    "texts": {
      "lds2013": "We believe in being subject to kings, presidents, rulers, and magistrates, in obeying, honoring, and sustaining the law."
    },
    "source": "builtin"
  },
  {
    "id": "p_ad44e6c1",
    "ref": "Articles of Faith 1:13",
    "topic": "Article of Faith 13",
    "texts": {
      "lds2013": "We believe in being honest, true, chaste, benevolent, virtuous, and in doing good to all men; indeed, we may say that we follow the admonition of Paul—We believe all things, we hope all things, we have endured many things, and hope to be able to endure all things. If there is anything virtuous, lovely, or of good report or praiseworthy, we seek after these things."
    },
    "source": "builtin"
  }
];
const ARTICLES_OF_FAITH_CAMPAIGN = {
  "id": "camp_aof",
  "track": "seminary",
  "name": "The Articles of Faith Tower",
  "shortName": "Articles of Faith",
  "subtitle": "Thirteen declarations of belief",
  "towerArt": {
    "kit": "restoration-temple",
    "baseWidth": 585
  },
  "hue": "#f472b6",
  "soft": "rgba(244,114,182,.22)",
  "icon": "📜",
  "tag": "Thirteen articles. One clear statement of faith.",
  "order": 10,
  "status": "active",
  "group": "articles",
  "passageIds": [
    "p_67a6a04b",
    "p_89bd3937",
    "p_3ae020e3",
    "p_c49ad9d1",
    "p_a4c739fe",
    "p_69a93226",
    "p_78373ac6",
    "p_f88417cb",
    "p_9804282d",
    "p_44894f85",
    "p_b615fde6",
    "p_3813fae7",
    "p_ad44e6c1"
  ]
};
SQ.registerContentPack({id:"seminary-articles-of-faith",defaultTranslation:"lds2013",
  passages:ARTICLES_OF_FAITH_PASSAGES,campaigns:[ARTICLES_OF_FAITH_CAMPAIGN]});
