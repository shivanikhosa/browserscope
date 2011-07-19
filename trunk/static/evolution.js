var Viz = {
  /**
  *	@param {Object}	resultSet complete result set
  *	@param {Array} selectedBrowsers to filter result set
  *	@param {Object} opts
  */
  init: function(resultSet, selectedBrowsers, opts){
    this.containerId = opts.containerId || 'evolution';
    this.opts = opts || {};

    this.presetsEl = document.getElementById(this.containerId + '-presets');
    this.multiSelectEl = document.getElementById(this.containerId +
        '-browserList');
    this.filtersEl = document.getElementById(this.containerId + '-filters');
    this.filterBtn = document.getElementById(this.containerId + '-filter');

    // Initially hides optional elements.
    var optEls = [this.presetsEl, this.multiSelectEl, this.filtersEl,
        this.filterBtn];
    for (var i = 0, optEl; optEl = optEls[i]; i++) {
      optEl.style.display = 'none';
    }

    // sets the default
    if (typeof this.opts.multiLine == 'undefined') {
      this.opts.multiLine = false;
    }
    if (this.opts.multiSelect) {
      this.enableMultiSelect(resultSet);
    }

    var canvas = document.getElementById(this.containerId);
    canvas.innerHTML = '';
    canvas.style.backgroundColor = Viz.Colors.backgroundColor;
    canvas.style.width = '1100px';

    if (selectedBrowsers && selectedBrowsers.length){
      resultSet = this.filterBrowsers(resultSet,selectedBrowsers);
    }

    var selectedResults = this.buildData(resultSet);
    var bandHeight = this.opts.multiLine ? (selectedResults.length*26) : 0; // (26 = height of band + border)
    var height = bandHeight + 425 + 150; // (425 = ruler + main frame height), (150 padding)

    canvas.style.height = (height) + 'px';

    if (opts && opts.presets) this.setPresets(resultSet,opts.presets);

    var r = Raphael(this.containerId, 1100, height);
    Raphael.getColor.reset();
    r.customAttributes.score = function(score){
      return score;
    }

    var endText = opts.endText || 'HTML5 Ready';

    //Print Text
    r.text(1051,225, endText).
      attr({
        stroke:this.Colors.fontColor,
       'font-family': 'Impact',
       fill:this.Colors.fontColor,
      'font-size':'67px'}).
      rotate(90);

    /*
    r.text(1080,418,'*').attr({fill:this.Colors.fontColor,'font-size':'18px'})
    r.text(1027,438,'based on ').attr({fill:this.Colors.fontColor,'font-size':'10px','stroke-opacity':'0'})
    r.text(1075,438,'modernizr').attr({fill:Viz.Colors.link,'font-size':'10px','stroke-opacity':'0','font-weight':'bold', href:"http://www.modernizr.com"})
    r.text(1050,458,'2.0.4 test data').attr({fill:this.Colors.fontColor,'font-size':'10px','stroke-opacity':'0'})
    */

    //Render Frames
    r.rect(1000,25,100,400).attr({'fill':Viz.Colors.htmlBG,'stroke':Viz.Colors.htmlBG}).toBack();
    r.rect(0,25,1000,400).attr({'fill':Viz.Colors.timelineBG,'stroke':Viz.Colors.timelineBG}).toBack();

    // render grid lines
    for(var i=0; i<=1000;){
      r.path('M ' + i + ',0 L' + i + ',10').attr({stroke:this.Colors.fontColor});
      r.path('M ' + i + ',25 L' + i + ',425').attr({stroke:this.Colors.fontColor,opacity:'0.2'});
      if(opts.allMarkers){
      	var label = i/10 + ((i==0 || i==1000) ? '%' : '');
      }else{
      	var label = (i==0 || i==1000) ? i/10 + '%' : '';      	
      }	
      r.text(i+7,7,label).attr({fill:this.Colors.fontColor,'font-size':'11px','text-anchor':'start'})
      i += 100;
    }

    //render apes ;)
    var evolution = r.set();
    evolution.push(
      r.path('M 864.01 47.76 C 868.50 48.39 872.78 46.88 877.04 45.72 C 881.39 46.97 886.17 46.52 890.23 48.72 C 893.09 50.12 896.39 49.80 899.47 50.34 C 899.36 52.91 898.83 55.44 898.15 57.92 C 900.18 60.89 902.41 63.75 904.05 66.97 C 905.47 69.37 904.31 72.17 904.51 74.76 C 906.01 77.96 908.32 80.69 910.06 83.77 C 908.21 85.98 906.32 88.33 905.98 91.30 C 906.60 93.96 908.20 96.29 908.85 98.96 C 908.25 101.53 906.94 104.87 903.86 105.03 C 899.94 105.55 895.95 105.46 892.08 104.62 C 891.52 106.16 891.00 107.73 890.44 109.27 C 889.56 110.95 889.50 112.96 890.58 114.58 C 895.41 125.76 900.89 136.91 902.99 149.00 C 904.11 153.41 899.80 157.26 901.30 161.56 C 903.02 167.40 904.80 173.24 905.77 179.27 C 906.28 181.63 906.43 184.13 907.52 186.32 C 910.67 189.22 914.11 191.82 917.20 194.81 C 921.42 198.85 927.45 201.91 933.41 200.42 C 936.57 199.82 939.82 200.20 942.93 200.98 C 947.46 201.55 949.47 206.15 952.41 209.04 C 950.43 214.43 949.97 221.39 944.29 224.39 C 941.08 226.73 937.31 224.18 934.44 222.53 C 929.18 219.62 926.09 213.93 920.53 211.51 C 916.51 209.68 912.40 208.06 908.43 206.14 C 907.92 215.70 905.79 225.09 903.19 234.28 C 902.20 236.76 903.90 239.18 904.58 241.52 C 910.76 257.13 913.99 273.67 916.67 290.19 C 917.46 296.22 920.29 301.74 921.23 307.75 C 921.73 316.60 920.09 325.52 921.73 334.31 C 923.83 349.27 928.15 363.90 934.39 377.64 C 935.60 380.49 937.76 382.75 940.33 384.44 C 941.49 385.72 943.29 385.33 944.66 384.62 C 947.75 383.45 951.01 382.64 953.82 380.84 C 957.67 378.50 961.34 375.35 965.99 374.86 C 969.10 375.15 971.94 376.59 974.78 377.81 C 974.36 380.02 974.11 382.30 973.38 384.44 C 971.70 386.71 969.43 388.47 967.84 390.81 C 965.88 393.43 964.31 396.60 961.34 398.24 C 958.30 399.16 955.07 398.52 951.96 398.72 C 942.26 398.79 934.01 404.76 924.70 406.61 C 920.91 407.33 917.11 404.84 915.20 401.71 C 914.63 399.27 915.09 396.76 915.35 394.32 C 915.85 390.82 916.08 387.23 915.31 383.75 C 913.38 375.36 908.57 368.09 904.27 360.77 C 900.93 355.12 897.37 349.61 894.09 343.93 C 892.19 340.40 890.14 336.69 890.11 332.58 C 890.13 330.80 889.88 329.05 889.46 327.33 C 889.41 326.92 889.30 326.09 889.25 325.68 C 889.53 320.15 890.42 314.53 889.23 309.04 C 885.69 303.61 881.91 298.33 878.05 293.13 C 876.72 296.09 875.78 299.25 874.01 301.99 C 871.33 304.72 867.44 305.96 864.99 308.98 C 856.98 318.20 850.46 328.58 843.89 338.85 C 838.19 348.02 831.85 356.98 828.37 367.30 C 827.60 368.66 827.30 370.45 828.56 371.64 C 831.69 376.01 835.33 380.22 840.01 382.98 C 843.92 385.29 848.63 385.42 852.71 387.30 C 854.53 389.28 857.23 392.39 855.23 395.13 C 854.18 396.94 851.91 397.03 850.09 397.21 C 846.08 397.43 842.07 398.00 838.07 397.65 C 833.83 397.12 830.69 393.98 827.41 391.58 C 819.96 385.93 810.41 384.30 802.56 379.40 C 800.55 378.18 798.79 375.89 799.52 373.42 C 800.84 369.21 804.93 366.88 807.58 363.59 C 817.61 351.76 822.71 336.81 827.29 322.24 C 829.54 315.30 830.18 307.15 836.09 302.10 C 840.93 298.04 847.18 295.04 849.46 288.67 C 850.66 286.73 850.06 284.39 849.46 282.37 C 849.30 281.65 848.98 280.21 848.82 279.49 C 848.55 275.90 848.50 272.30 848.72 268.71 C 849.89 261.63 852.54 254.93 854.34 248.02 C 854.08 243.98 852.26 240.07 852.88 235.96 C 854.07 226.59 858.35 217.99 860.74 208.93 C 861.10 200.03 860.16 190.81 856.44 182.62 C 853.51 175.75 852.06 168.39 850.21 161.19 C 846.77 164.35 842.25 167.05 840.68 171.68 C 839.72 178.13 840.05 184.69 840.21 191.19 C 840.22 193.92 840.04 196.67 839.50 199.35 C 839.05 201.05 838.82 202.82 839.06 204.58 C 839.17 206.14 839.18 207.70 839.06 209.26 C 838.80 210.45 838.99 211.67 839.55 212.76 C 841.16 217.70 841.69 223.04 844.47 227.55 C 846.63 232.01 849.48 237.31 847.29 242.28 C 846.05 245.08 845.96 248.17 845.69 251.18 C 838.44 249.91 829.04 250.50 824.67 243.37 C 822.57 241.20 822.75 238.09 823.40 235.37 C 824.44 230.38 825.28 225.29 824.82 220.17 C 824.65 217.32 824.42 214.48 824.14 211.64 C 823.99 210.01 823.79 208.37 823.94 206.73 C 824.15 205.54 823.98 204.33 823.49 203.23 C 822.25 198.91 822.07 194.37 821.13 189.98 C 820.06 183.91 817.39 178.18 817.05 171.98 C 816.85 167.72 820.39 164.76 822.30 161.31 C 825.84 155.98 824.79 148.88 828.70 143.72 C 832.55 138.60 837.19 134.07 840.62 128.62 C 843.09 124.67 843.53 119.45 847.38 116.41 C 854.14 110.87 862.46 106.95 867.60 99.63 C 863.61 95.09 860.88 89.61 857.69 84.53 C 856.20 79.70 851.66 74.98 853.41 69.75 C 853.98 68.68 854.15 67.47 854.03 66.28 C 853.90 62.93 855.90 60.07 856.72 56.93 C 857.41 52.70 861.94 51.16 864.01 47.76 Z'),
      r.path('M 680.26 88.27 C 684.10 81.21 690.97 75.82 698.98 74.44 C 700.45 74.77 701.85 75.36 703.31 75.80 C 704.35 76.18 705.42 76.30 706.54 76.14 C 709.92 75.92 713.29 75.47 716.68 75.24 C 716.92 76.18 717.22 77.11 717.58 78.02 C 720.21 78.94 722.71 77.28 725.11 76.40 C 725.36 80.62 724.79 84.90 726.11 89.00 C 725.07 89.98 724.03 90.95 723.00 91.93 C 725.65 94.93 727.79 98.31 729.54 101.91 C 728.80 103.37 727.98 104.79 727.40 106.32 C 728.06 109.90 729.05 113.42 729.38 117.07 C 728.03 117.51 726.70 118.01 725.36 118.44 C 725.45 120.16 725.90 121.92 725.53 123.63 C 723.93 126.31 721.78 128.61 719.93 131.11 C 718.92 133.84 718.85 136.79 718.40 139.64 C 713.26 140.52 708.14 141.53 702.94 141.85 C 702.51 142.97 702.16 144.10 701.88 145.26 C 701.35 146.44 701.92 147.67 702.45 148.73 C 703.91 152.42 704.60 156.36 705.95 160.10 C 707.74 165.72 710.90 171.01 711.26 177.01 C 711.12 181.36 708.19 184.81 705.69 188.11 C 705.36 190.84 705.51 193.60 705.69 196.34 C 706.31 205.65 706.68 215.15 704.53 224.31 C 702.89 231.54 700.67 238.67 697.52 245.40 C 694.61 251.40 697.04 258.10 698.90 264.02 C 701.12 271.42 703.04 278.94 704.27 286.57 C 705.44 293.78 704.26 301.33 706.90 308.29 C 707.56 310.75 709.08 313.25 708.28 315.86 C 707.46 318.64 706.91 321.75 704.99 323.99 C 702.10 325.74 698.77 326.49 695.66 327.69 C 690.90 329.25 686.74 332.09 682.38 334.48 C 681.18 341.72 681.06 349.12 679.59 356.32 C 679.08 358.02 678.82 359.80 678.92 361.58 C 679.00 368.15 676.38 374.45 676.73 381.04 C 676.79 384.07 678.91 387.41 682.19 387.53 C 686.10 387.72 690.03 387.79 693.96 387.77 C 697.16 387.86 699.79 385.82 702.45 384.33 C 704.82 387.57 704.64 391.66 702.57 395.00 C 702.07 394.96 701.06 394.89 700.55 394.85 C 698.79 394.57 697.04 394.96 695.44 395.67 C 688.94 398.29 681.77 398.06 675.13 400.16 C 670.90 401.19 666.72 403.39 662.26 402.68 C 660.37 402.39 658.14 401.08 658.23 398.92 C 658.58 394.91 660.57 391.27 661.27 387.33 C 662.51 381.51 661.97 375.54 661.30 369.69 C 661.09 367.65 661.02 365.59 661.04 363.55 C 661.12 361.47 660.93 359.40 660.54 357.37 C 660.16 355.01 659.97 352.62 659.71 350.26 C 656.33 353.02 653.11 355.96 649.77 358.77 C 645.83 362.15 641.15 364.84 638.32 369.34 C 635.29 374.05 631.80 379.12 632.15 384.99 C 632.14 388.76 633.58 392.30 635.16 395.65 C 638.47 395.69 641.79 395.83 645.06 396.42 C 644.76 398.14 644.98 400.26 643.47 401.48 C 640.66 403.97 636.76 404.40 633.31 405.49 C 629.49 406.67 625.10 407.59 621.37 405.65 C 618.90 395.96 617.12 385.81 611.97 377.05 C 610.70 374.66 608.96 372.27 608.94 369.46 C 609.00 368.16 609.04 366.87 609.04 365.57 C 608.97 364.26 609.54 363.31 610.75 362.74 C 617.38 358.56 625.84 358.08 631.92 352.93 C 637.06 348.33 641.74 343.08 644.92 336.91 C 648.22 330.56 653.16 325.06 659.24 321.25 C 660.85 319.99 663.29 319.09 663.52 316.76 C 664.71 310.98 665.78 304.99 664.59 299.12 C 663.69 294.40 663.58 289.29 660.88 285.15 C 657.07 279.03 653.49 272.70 651.21 265.84 C 649.04 259.74 648.28 253.28 647.13 246.95 C 646.65 243.80 645.85 240.41 647.23 237.38 C 650.20 230.40 653.61 223.50 655.33 216.08 C 653.99 211.67 651.25 207.71 650.31 203.20 C 651.51 200.10 653.49 197.22 653.73 193.81 C 654.24 187.84 652.81 181.93 652.84 175.96 C 652.81 169.87 652.56 163.79 652.71 157.70 C 653.07 152.75 656.37 148.81 658.51 144.54 C 660.96 139.76 663.88 134.95 668.73 132.25 C 670.22 131.25 671.76 130.31 673.26 129.29 C 671.58 130.14 669.96 131.07 668.28 131.89 C 667.81 131.77 666.88 131.54 666.41 131.43 C 667.71 128.80 668.40 125.81 670.20 123.45 C 670.91 122.60 671.68 121.80 672.46 121.00 C 672.02 119.58 671.67 118.13 671.23 116.72 L 671.14 116.38 C 672.51 112.55 672.65 108.29 670.04 104.94 C 671.51 102.37 672.59 99.55 674.66 97.37 C 674.63 97.02 674.57 96.32 674.53 95.97 C 674.49 95.47 674.40 94.49 674.35 94.00 C 675.74 91.67 678.94 90.79 680.26 88.27 Z'),
      r.path('M 486.59 112.61 C 491.22 110.38 497.38 109.93 501.44 113.57 C 504.56 116.49 507.69 119.42 510.83 122.34 C 510.49 125.08 510.12 127.82 509.96 130.58 C 511.32 132.05 513.43 133.08 513.85 135.20 C 514.69 138.85 517.71 141.68 517.55 145.60 C 512.64 148.20 509.52 153.33 504.08 155.06 C 499.94 157.15 495.36 155.79 491.06 155.19 C 490.29 163.25 495.11 170.14 497.55 177.47 C 499.43 182.99 502.18 188.25 503.24 194.01 C 502.74 198.13 500.18 201.71 499.72 205.82 C 501.49 208.95 504.02 211.81 504.32 215.57 C 505.38 224.61 510.79 232.27 512.98 241.00 C 514.19 246.26 517.45 250.95 517.88 256.38 C 517.80 257.81 517.97 259.26 518.57 260.59 C 519.96 264.78 521.06 269.08 523.03 273.06 C 524.00 275.56 525.53 278.93 523.39 281.24 C 520.20 284.73 517.08 288.44 513.06 290.99 C 510.62 292.60 507.66 291.53 505.02 291.19 C 505.54 289.10 505.40 286.70 506.83 284.95 C 508.95 281.85 512.66 279.24 512.21 275.03 C 511.32 266.01 505.84 258.55 500.59 251.52 C 497.90 246.44 494.94 241.40 490.55 237.58 C 488.29 242.70 487.86 248.60 484.45 253.20 C 483.74 253.91 483.42 254.78 483.50 255.78 C 483.32 257.83 482.27 259.73 482.31 261.80 C 482.85 265.46 484.09 268.99 485.77 272.28 C 490.45 281.83 494.92 291.52 498.24 301.65 C 499.94 306.91 502.05 312.15 502.25 317.75 C 502.43 321.29 502.61 324.83 502.72 328.38 C 502.70 328.97 502.64 330.14 502.62 330.73 C 502.23 334.25 502.26 337.81 502.73 341.32 C 503.69 347.18 503.16 353.10 502.85 358.98 C 503.36 366.81 503.08 374.75 504.63 382.48 C 505.15 385.10 505.99 388.09 508.66 389.30 C 514.51 392.35 521.03 394.02 527.59 394.65 C 532.37 394.93 536.90 396.64 540.95 399.16 C 540.90 399.82 540.81 401.13 540.76 401.79 C 539.55 402.26 538.35 402.77 537.11 403.16 C 528.29 403.25 519.43 402.48 510.65 403.68 C 505.86 404.17 501.12 405.04 496.48 406.32 C 493.48 407.07 489.41 407.19 487.59 404.21 C 487.58 400.40 487.79 396.60 487.80 392.79 C 488.67 385.39 488.00 378.01 487.24 370.64 C 487.44 369.38 486.57 368.41 485.86 367.51 C 485.17 366.35 484.91 365.06 485.06 363.62 C 485.12 361.61 484.47 359.70 483.63 357.91 C 482.88 356.15 483.22 354.19 483.30 352.35 C 483.52 349.60 483.76 346.86 483.83 344.11 C 484.19 336.38 484.91 328.35 481.76 321.05 C 478.31 314.96 473.27 310.03 468.43 305.07 C 466.59 309.19 464.21 313.02 461.72 316.77 C 457.18 324.34 449.71 329.44 444.42 336.43 C 435.90 347.65 427.75 359.14 419.62 370.65 C 418.18 372.90 415.78 375.70 417.52 378.44 C 420.02 382.78 423.78 386.20 427.15 389.87 C 431.03 394.75 437.84 394.62 443.44 395.74 C 443.82 396.82 444.14 397.92 444.39 399.04 C 442.02 399.82 439.66 400.70 437.20 401.16 C 433.77 401.41 430.31 401.47 426.88 401.27 C 422.75 399.49 419.10 396.82 415.07 394.87 C 408.58 391.93 401.59 390.38 394.84 388.20 C 392.89 387.62 390.15 385.82 391.48 383.47 C 394.17 378.66 399.26 375.80 402.08 371.07 C 408.98 359.72 411.91 346.37 419.31 335.30 C 423.75 330.26 427.88 324.95 432.33 319.91 C 433.08 319.18 433.35 318.30 433.14 317.25 C 434.38 315.15 436.51 313.74 437.74 311.64 C 438.64 309.17 439.39 306.64 440.07 304.11 C 440.66 301.02 440.64 297.86 440.76 294.73 C 440.81 289.76 442.17 284.91 442.42 279.96 C 440.75 274.31 437.28 269.27 436.16 263.41 C 436.09 261.46 436.05 259.51 436.02 257.56 C 436.63 251.37 441.28 246.67 443.20 240.94 C 443.06 232.73 441.34 224.55 442.09 216.31 C 442.65 208.76 443.74 201.10 442.26 193.58 C 442.28 188.55 443.20 183.53 444.49 178.68 C 445.00 177.32 445.18 175.88 445.13 174.44 C 444.84 171.87 446.73 170.00 448.07 168.07 C 450.79 164.48 451.54 159.83 454.30 156.26 C 456.95 152.87 458.60 148.73 462.08 146.04 C 464.80 143.94 464.66 140.31 465.16 137.25 C 468.23 126.37 476.51 117.47 486.59 112.61 Z'),
      r.path('M 276.67 204.47 C 280.84 190.93 294.65 180.43 309.02 181.56 C 315.40 182.18 318.93 187.91 323.05 192.03 C 325.38 193.74 323.52 197.42 326.07 199.00 C 330.62 202.07 332.42 207.54 332.94 212.76 C 330.97 215.48 328.05 217.33 325.95 219.95 C 324.02 222.73 320.06 222.24 317.43 220.82 C 315.54 219.68 313.26 219.57 311.22 220.35 C 308.81 221.15 305.84 221.08 304.03 223.10 C 302.63 224.79 301.47 226.72 300.68 228.77 C 299.78 232.17 299.38 235.73 299.81 239.24 C 300.53 242.66 300.32 246.20 297.95 248.95 C 295.39 254.96 290.50 260.20 290.09 266.94 C 290.57 272.97 293.47 278.46 296.20 283.76 C 299.36 290.64 303.95 296.71 308.25 302.90 C 308.33 306.31 308.25 309.73 308.32 313.15 C 305.36 316.58 302.87 320.52 299.22 323.29 C 296.92 324.42 294.40 324.99 291.99 325.82 C 292.31 321.21 294.63 317.09 295.19 312.54 C 295.56 311.12 295.26 309.61 294.46 308.40 C 290.98 302.13 286.58 296.41 283.59 289.87 C 282.80 288.12 280.66 290.14 281.56 291.46 C 281.91 296.72 285.09 301.22 285.84 306.34 C 285.73 307.52 285.95 308.71 286.57 309.74 C 288.41 314.29 289.69 319.12 290.21 324.01 C 290.69 328.55 284.82 331.75 286.56 336.32 C 288.54 341.98 290.64 347.69 291.28 353.70 C 291.42 357.23 291.45 360.79 291.89 364.31 C 292.92 370.67 291.65 377.06 291.99 383.45 C 291.80 384.90 291.90 386.38 292.49 387.74 C 293.36 389.35 293.06 392.25 295.37 392.53 C 299.71 393.52 304.18 393.73 308.55 394.61 C 314.09 395.73 319.76 395.18 325.37 395.47 C 325.04 397.21 325.49 399.62 323.57 400.55 C 319.01 403.25 313.56 405.83 308.23 403.82 C 304.45 402.91 300.47 402.79 296.70 403.81 C 292.52 404.76 288.52 406.95 284.14 406.69 C 282.02 406.44 279.10 405.79 278.78 403.24 C 278.89 398.37 278.99 393.48 278.28 388.65 C 277.76 384.62 277.32 380.58 276.98 376.53 C 276.97 374.65 275.74 373.15 274.73 371.69 C 270.49 364.42 268.91 356.01 265.06 348.55 C 261.46 353.54 258.64 359.11 254.66 363.80 C 253.68 364.36 252.66 364.99 252.21 366.08 C 249.15 371.34 246.16 376.65 243.13 381.93 C 246.13 385.91 248.45 390.50 252.11 393.92 C 256.93 396.34 262.59 396.78 267.19 399.82 C 267.08 400.64 266.85 402.29 266.74 403.11 C 266.34 403.12 265.55 403.15 265.16 403.17 C 260.62 403.24 256.10 403.56 251.57 403.77 C 241.59 403.22 234.43 395.51 226.27 390.75 C 224.09 389.27 220.99 388.03 220.69 385.02 C 222.00 382.07 224.71 380.12 226.54 377.52 C 228.94 374.26 229.58 370.10 231.73 366.71 C 237.73 356.36 241.46 344.92 247.35 334.51 C 248.49 332.68 248.38 330.35 247.39 328.49 C 246.25 326.05 245.27 323.51 243.64 321.35 C 239.88 316.22 237.00 310.54 234.09 304.92 C 232.97 302.73 230.91 301.09 230.08 298.77 C 230.65 291.56 233.15 284.64 235.78 277.96 C 237.35 273.32 236.78 268.22 238.51 263.61 C 240.05 259.27 241.45 254.86 243.38 250.67 C 244.03 249.65 244.21 248.45 244.09 247.27 C 244.82 241.16 249.12 236.31 252.07 231.13 C 255.05 224.96 261.39 221.68 266.25 217.21 C 268.31 215.12 271.03 213.96 273.50 212.46 C 276.15 210.75 276.11 207.23 276.67 204.47 Z'),
      r.path('M 128.15 268.09 C 134.20 263.15 142.06 259.86 149.97 260.78 C 155.23 262.09 158.20 267.23 161.94 270.70 C 162.30 274.24 165.11 276.28 167.35 278.69 C 168.34 281.63 168.64 284.76 169.56 287.73 C 165.70 289.86 163.10 294.60 158.50 295.05 C 157.19 294.97 155.88 294.92 154.58 295.03 C 150.35 295.24 146.12 295.48 141.89 295.43 C 137.59 295.29 133.98 297.94 130.29 299.75 C 126.95 300.92 127.81 305.26 126.36 307.87 C 125.63 309.01 124.97 310.20 124.66 311.54 C 124.47 312.12 124.11 313.28 123.93 313.87 C 123.11 316.81 122.88 319.88 122.94 322.93 C 123.55 326.06 125.31 328.90 125.56 332.11 C 125.22 342.37 129.06 352.13 131.20 362.02 C 132.41 368.85 135.04 375.48 135.09 382.48 C 135.03 384.48 135.03 386.49 135.07 388.50 C 135.27 393.25 132.45 397.29 129.73 400.90 C 124.44 400.26 119.19 399.00 114.50 396.39 C 116.32 394.55 118.44 393.06 120.26 391.23 C 121.43 388.30 122.12 385.15 122.41 382.02 C 122.16 378.81 120.78 375.82 120.04 372.72 C 119.77 371.38 119.21 370.14 118.56 368.96 C 116.43 365.07 115.88 360.64 114.38 356.54 C 112.07 353.05 110.90 349.05 109.47 345.16 C 108.32 347.84 107.93 350.74 107.29 353.57 C 106.63 356.72 103.31 358.34 102.24 361.29 C 101.66 364.08 101.39 366.93 100.77 369.72 C 100.04 373.54 100.04 377.44 99.93 381.32 C 99.51 386.38 99.52 391.54 100.80 396.50 C 101.47 399.03 104.44 399.77 106.70 400.21 C 109.48 400.63 112.29 400.75 115.09 401.04 C 115.65 401.10 116.76 401.24 117.31 401.31 C 117.69 402.70 118.06 404.10 118.43 405.51 C 110.19 405.04 101.89 404.73 93.68 405.79 C 90.97 406.21 88.20 406.37 85.50 405.78 L 85.72 404.70 C 86.03 403.36 86.14 402.00 86.21 400.64 C 86.72 396.42 88.41 392.33 87.93 388.02 C 87.89 384.78 86.34 381.89 85.12 378.99 C 84.51 373.59 84.18 368.16 83.83 362.74 C 83.75 361.05 83.66 359.36 83.53 357.69 C 76.76 363.69 69.04 368.43 61.75 373.74 C 56.82 377.52 50.36 379.38 46.59 384.56 C 45.62 388.03 46.46 392.25 49.34 394.61 C 53.27 397.93 58.48 398.85 63.02 400.98 C 65.20 401.82 65.71 404.25 66.49 406.18 L 65.34 406.22 C 61.13 406.32 56.91 406.39 52.70 406.39 C 50.51 406.55 48.52 405.48 47.05 403.93 C 42.38 399.27 37.68 394.62 32.52 390.48 C 30.65 388.84 27.81 387.04 28.79 384.11 C 30.16 380.69 33.72 378.81 35.77 375.82 C 38.49 371.31 43.95 370.04 47.77 366.76 C 52.65 362.54 57.72 358.40 63.65 355.74 C 63.76 355.05 63.97 353.68 64.08 353.00 C 56.03 347.66 49.42 338.12 51.40 328.09 C 52.41 323.86 52.50 318.98 55.68 315.69 C 58.99 311.95 62.65 308.53 66.84 305.81 C 72.20 302.17 74.85 295.89 79.99 292.03 C 85.50 287.53 90.29 282.20 94.65 276.60 C 98.87 272.53 104.67 270.77 110.30 269.75 C 112.95 269.71 115.59 269.77 118.24 269.81 C 121.56 269.73 125.53 270.69 128.15 268.09 M 84.21 332.59 C 88.14 334.76 91.72 337.44 95.05 340.45 C 96.94 335.71 96.82 330.67 96.58 325.68 C 92.54 328.14 88.40 330.40 84.21 332.59 Z')
    ).attr({fill:Viz.Colors.silhouette,stroke:Viz.Colors.stroke})

    this.renderScores(selectedResults,r)
  },
  /**
  *	@param {Object} obj
  *	@param {Object} r Raphael object
  */
  setScore: function(obj,r) {
  	function fin(e){
        var y = e.clientY + window.scrollY - document.getElementById(Viz.containerId).offsetTop;
        var x = e.clientX - document.getElementById(Viz.containerId).offsetLeft + 5;
        this.flag = r.set();
        var score = this.attrs.score  || this.prev.attrs.score;
        var popAttrs = {'stroke-opacity':'0','text-anchor':'start',fill:Viz.Colors.fontColor,'font-size':'13px'};
        var txtAttrs = {fill:Viz.Colors.hoverText,'font-size':'15px'};
        if(this.type == 'path'){
    	    var t = r.text(x+20,y-10, score +'%' + ' - ' + obj.browser).attr(popAttrs);
	        var dims = t.getBBox();        
	       	var p = r.path('M ' + x + ',' + (y-10) + ' L '  + (x+13) + ',' + (y-20) + ' L '  + (x+40+dims.width) + ',' + (y-20) + ' L '  + (x+40+dims.width) + ',' + (y) + ' L ' + (x+13) + ',' + (y) + ' L ' + x + ',' + (y-10))
          	.attr({fill:this.attrs.stroke,'stroke-opacity':0});
        	this.attr({stroke:Viz.Colors.hoverColor,fill:Viz.Colors.hoverColor});
	    	this.next.attr(txtAttrs);
      	}else if(this.type == 'text'){
        	this.prev.attr({stroke:Viz.Colors.hoverColor,fill:Viz.Colors.hoverColor});
	    	var t = r.text(x+20,y-10, score +'%').attr(popAttrs);
			var p = r.path('M ' + x + ',' + (y-10) + ' L '  + (x+13) + ',' + (y-20) + ' L '  + (x+60) + ',' + (y-20) + ' L '  + (x+60) + ',' + (y) + ' L ' + (x+13) + ',' + (y) + ' L ' + x + ',' + (y-10))
			.attr({fill:obj.fill,'stroke-opacity':0});
	    	this.attr(txtAttrs);			
      	}
        t.toFront();      	
        this.flag.push(p,t);      	
	}
	function fout(){
      	if(this.type == 'path'){
      		this.attr({stroke:obj.fill,fill:obj.fill});
      		this.next.attr({fill:Viz.Colors.fontColor,'font-size':'12px'});
      	}else if(this.type == 'text'){
      		this.prev.attr({stroke:obj.fill,fill:obj.fill});      	
      		this.attr({fill:Viz.Colors.fontColor,'font-size':'12px'});
      	}
        this.flag.animate({opacity: 0}, 300, function(){this.remove()});
    }
    obj.fill = obj.fill || Raphael.getColor();
    r.path('M 0,' + (obj.y+1) + ' L1100,' + (obj.y)).attr({stroke:obj.seprator}).toBack()
    var scoreLine = r.set();
    scoreLine.push(
	    r.path('M 0,' + obj.y + ' L 5,' + (obj.y-5) + ' L,5,25' + ' L 6,25 L 6,' + (obj.y-5) + ' L 10,' + obj.y + ' L 0,' + obj.y).animate({path:'M ' + (obj.x-5) + ',' + obj.y + ' L ' + obj.x + ',' + (obj.y-5) + ' L ' + obj.x + ',25' + ' L ' + (obj.x+1) + ',25 L ' + (obj.x+1) + ',' + (obj.y-5) + ' L ' + (obj.x+5) + ',' + obj.y + ' L ' + (obj.x-5) + ',' + obj.y},1250,'bounce').attr({score:obj.score,stroke:obj.fill,fill:obj.fill}),
    	r.text(0,obj.y+10,obj.browser).animate({x:obj.x-25+13,y:obj.y+32},1250,'bounce').attr({'stroke-opacity':'0','text-anchor':'end',fill:this.Colors.fontColor,'font-size':'12px','font-family':'Arial',cursor:'default'}).rotate(285,obj.x-21,obj.y+10).toFront()
    ).hover(fin,fout),
    r.rect(0,(obj.y-25),1100,25).attr({'fill':obj.band,'stroke':obj.band}).toBack();
  },
  /**
  *	@param {Array} results
  *	@param {Object} r Raphael object
  */
  renderScores: function(results,r) {
    var start = 450;
    for(i=0; i<results.length;i++){
      var result = results[i];
      var band = (i%2==0) ? Viz.Colors.band1 : Viz.Colors.band2;
      var x = result.score * 10;
      // Don't bother rendering 0s.
      if (x === 0) {
        continue;
      }
      this.setScore({seprator:Viz.Colors.timelineBG,browser:result.browser, band:band, y: start, x: x, fill:result.fill,score:result.score},r);
      if(this.opts.multiLine)start += 25;
    }
  },
  /**
  *	@param {Object} ob
  *	@return {Array}
  */
  buildData: function(ob) {
    var x = [];
    var cache = {};
    for(var i in ob){
      var score = ob[i].summary_score;

      var browser = i.split(' ')[0];
      if(cache[browser]){
        var color = cache[browser];
      }else{
        var color =  Raphael.getColor();
        cache[browser] = color;
      }
      x.push({browser:i,score:score,fill:color})
    }
    return x;
  },
  /**
  *	@param {Object} o
  */
  populateList: function(o){
    var list = document.getElementById('browserList');
    var opts = ''
    for(var i in o){
      opts += '<option>' + i + '<\/option>';
    }
    list.innerHTML = opts;
  },
  /**
  *	@param {Object} results
  *	@param {Object} presets
  */
  setPresets: function(results,presets){
    var pre = this.presetsEl;
    pre.innerHTML = '';
    var instance = this;
    for(var p in presets){
      var li = document.createElement('li');
      li.innerHTML = p;
      li.onclick = function(){
        Viz.init(results, presets[p], instance.opts);
      }
      pre.appendChild(li);
    }
    pre.style.display = 'block';
  },
  /**
  *	@param {Object} results
  */
  enableMultiSelect: function(results){
    this.populateList(results)
    var instance = this;
    this.filterBtn.onclick = function() {
      Viz.init(results, Viz.getSelectedBrowsers(), instance.opts);
    }
    this.filterBtn.style.display = this.filtersEl.style.display =
        this.multiSelectEl.style.display = '';
  },
  /**
  *	@return {Array}
  */
  getSelectedBrowsers: function(){
    var x=[];
    var list = document.getElementById('browserList');
    for(i=0; i < list.options.length; i++){
      if(list.options[i].selected)x.push(list.options[i].text)
    }
    return x;
  },
  /**
  *	@param {Object} list
  *	@param {Array} selected
  *	@return {Object}
  */
  filterBrowsers: function(list,selected){
    var x = {};
    for(var i in list){
      if(-1 != selected.indexOf(i)){
        x[i] = list[i];
      }
    }
    return x;
  },
  Colors: {
    silhouette : '#232323',
    htmlBG : '#222',
    timelineBG : '#777',
    band1 : '#363636',
    band2 : '#545454',
    link : '#2476da',
    stroke: '#111',
    fontColor: '#fff',
    backgroundColor: '#363636',
    hoverColor: '#fff',
    hoverText:'#7cbf00'
  }
};
