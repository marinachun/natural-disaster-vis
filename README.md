# natural-disaster-vis

The goal was to reproduce a visualization that was published in the New York Times. It shows the estimated cost of natural disasters in the U.S. between 1980 and 2017 with semicircles. When a user hovers over the semicircle, a tooltip with the disaster title and the cost. There is also an interactive legend to allow users to select/unselect the type of natural disaster they wish to see on the plot. 

Some external sources I used:
External sources:

1. https://stackoverflow.com/questions/52216447/how-to-group-g-elements-in-d3
- I used this to help me figure out how to group elements 

2. https://www.d3indepth.com/scales/
- This to help me plot the axis lines

3. https://github.com/d3/d3-time-format
- This helped me with formatting the time

4. https://github.com/UBC-InfoVis/2021-436V-case-studies/tree/master/case-study_measles-and-vaccines
- I used this case study to help me with grouping by year and how to enter() merge() exit()
- Was also used to help me plot the tooltip

5. https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-scatter-plot
- I followed this tutorial to plot the legend and see how to filter out the data every time it was pressed

6. https://piazza.com/class/kjkk5imzxj62xi?cid=228
- The piazza post helped me get an idea of what to do for the costliest disaster

7. https://piazza.com/class/kjkk5imzxj62xi?cid=139
- This helped me visualize how the nested data should be presented

8. https://piazza.com/class/kjkk5imzxj62xi?cid=170
- This helped me with figuring out the need for two x axes 

My Overall Process/Changes Made
1. At first, I plotted the legend on the index.html file but added and changed the labels to match the categories for the dataset. 
   Later on, I also realized to put it in the container class on the index.html file
   I also used the tutorial to follow what was written in the style.css file and added a few more attributes (ex: to wrap the row)
   I also took the code from the tutorial and edited a few things on the main.js to replace whatever was associated with difficulty to categories
2. For the the axes, I used what I had from before, and just edited the domain and range 
   But for the color scale, I did something similar to the D3 Case Study in the heatmap.js file
3. For updateVis(), after grouping the data, I decided to add extra attributes to calculate the maximum cost
   For the scale, I only included the yScale as the xAxis should never change
4. As for rendervis(), I followed the Case Study's heatmap.js file very closely and also had help during office hours
   But there were several things that I needed to change. For positioning (translating), I needed to change the values accordingly
   And rather than a rectangle, I had to append the semicircle and text
   To append the text, I got inspiration from the piazza post saying to add a new attribute
   I also added the tooltip here, which was also from the case study
5. For the tooltip, I also followed the Tutorial 3 Scatterplot example to what to include in the style.css file
